-- Fin & Feathers LV: staged alternative-time SMS workflow.
-- Review before applying. Does not modify existing booking-confirmation RPCs.
BEGIN;

-- Keep current types and add only the guest alternative-offer event.
ALTER TABLE public.reservation_notification_events
  DROP CONSTRAINT reservation_notification_type_check;
ALTER TABLE public.reservation_notification_events
  ADD CONSTRAINT reservation_notification_type_check
  CHECK (notification_type IN (
    'new_reservation', 'incomplete_reservation',
    'unvalidated_reservation', 'reservation_confirmed',
    'reservation_alternatives'
  ));

CREATE TABLE public.reservation_alternative_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_request_id uuid NOT NULL
    REFERENCES public.reservation_requests(id) ON DELETE CASCADE,
  notification_event_id uuid NOT NULL UNIQUE
    REFERENCES public.reservation_notification_events(id) ON DELETE RESTRICT,
  proposed_times time without time zone[] NOT NULL,
  -- All times apply to the reservation's original date, not a new date.
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','dispatching','sent','uncertain','accepted')),
  accepted_time time without time zone,
  inbound_message_sid text UNIQUE,
  dispatch_token uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  accepted_at timestamptz,
  CONSTRAINT alternative_offer_times_check CHECK (
    cardinality(proposed_times) BETWEEN 1 AND 3
  ),
  CONSTRAINT alternative_offer_accepted_check CHECK (
    status <> 'accepted' OR (
      accepted_time IS NOT NULL AND inbound_message_sid IS NOT NULL
      AND accepted_at IS NOT NULL
    )
  ),
  -- Initially allow one offer per reservation; later revisions need an explicit
  -- safe replacement/cancellation operation rather than silent overwrites.
  CONSTRAINT alternative_offer_one_per_reservation UNIQUE(reservation_request_id)
);

ALTER TABLE public.reservation_alternative_offers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reservation_alternative_offers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.reservation_alternative_offers TO authenticated;
CREATE POLICY alternative_offers_manager_read
  ON public.reservation_alternative_offers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.staff_roles sr
    WHERE sr.user_id = (SELECT auth.uid())
      AND sr.is_active AND sr.role = 'manager'
  ));

-- Called after the existing propose_alternatives action. Locks and verifies
-- the exact stored proposal, so an offer cannot be fabricated or changed.
CREATE FUNCTION public.prepare_reservation_alternative_offer(p_reservation_id uuid)
RETURNS TABLE(offer_id uuid, notification_event_id uuid, event_key text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_work public.reservation_staff_workflows%ROWTYPE;
  v_req public.reservation_requests%ROWTYPE;
  v_event uuid;
  v_offer uuid := gen_random_uuid();
  v_key text := 'reservation_alternatives:' || p_reservation_id::text || ':' || v_offer::text;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = v_user AND is_active AND role = 'manager'
  ) THEN RAISE EXCEPTION 'Manager access required' USING ERRCODE = '42501'; END IF;

  SELECT * INTO v_req FROM public.reservation_requests
   WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002'; END IF;
  IF v_req.request_status NOT IN ('pending','incomplete') OR NOT v_req.details_validated
     OR v_req.reservation_date IS NULL OR v_req.customer_phone IS NULL THEN
    RAISE EXCEPTION 'Reservation not eligible' USING ERRCODE = '22023'; END IF;

  SELECT * INTO v_work FROM public.reservation_staff_workflows
   WHERE reservation_request_id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR v_work.workflow_status <> 'alternatives_proposed'
     OR cardinality(v_work.proposed_times) NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'Save alternative times first' USING ERRCODE = '22023'; END IF;

  IF EXISTS (SELECT 1 FROM public.reservation_alternative_offers
             WHERE reservation_request_id = p_reservation_id) THEN
    RAISE EXCEPTION 'An offer already exists for this reservation'
      USING ERRCODE = '22023'; END IF;

  INSERT INTO public.reservation_notification_events
      (reservation_request_id,event_key,notification_type,notification_status)
  VALUES (p_reservation_id,v_key,'reservation_alternatives','pending')
  RETURNING id INTO v_event;

  INSERT INTO public.reservation_alternative_offers
      (id,reservation_request_id,notification_event_id,proposed_times,created_by)
  VALUES (v_offer,p_reservation_id,v_event,v_work.proposed_times,v_user);

  RETURN QUERY SELECT v_offer,v_event,v_key;
END;
$fn$;

-- Freeze an existing offer after it has been prepared. Staff cannot silently
-- change offered times or switch availability while an SMS is pending,
-- dispatching, sent, uncertain, or accepted. Normal send completion is the
-- one permitted transition from proposed to communicated.
CREATE FUNCTION public.guard_prepared_alternative_offer()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE
  v_offer public.reservation_alternative_offers%ROWTYPE;
BEGIN
  SELECT * INTO v_offer FROM public.reservation_alternative_offers
    WHERE reservation_request_id = NEW.reservation_request_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF NEW.proposed_times IS DISTINCT FROM OLD.proposed_times THEN
    RAISE EXCEPTION 'Alternative offer is already prepared; offered times cannot change'
      USING ERRCODE = '22023';
  END IF;

  IF NEW.workflow_status IS DISTINCT FROM OLD.workflow_status AND NOT (
    OLD.workflow_status = 'alternatives_proposed'
    AND NEW.workflow_status = 'alternatives_communicated'
    AND v_offer.status = 'sent'
  ) AND NOT (
    OLD.workflow_status = 'alternatives_communicated'
    AND NEW.workflow_status = 'alternative_accepted'
    AND v_offer.status = 'accepted'
  ) AND NOT (
    OLD.workflow_status = 'alternative_accepted'
    AND NEW.workflow_status = 'confirmed'
    AND v_offer.status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Prepared alternative offer prevents this status transition'
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$fn$;

CREATE TRIGGER guard_prepared_alternative_offer_update
  BEFORE UPDATE OF workflow_status, proposed_times
  ON public.reservation_staff_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_prepared_alternative_offer();

-- Atomic single-use claim before calling Twilio. An uncertain result is never
-- automatically retried (even when a network timeout obscures acceptance).
CREATE FUNCTION public.claim_reservation_alternative_offer(p_offer_id uuid)
RETURNS TABLE(offer_id uuid, notification_event_id uuid, event_key text, claim_token uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_offer public.reservation_alternative_offers%ROWTYPE;
  v_event public.reservation_notification_events%ROWTYPE;
  v_token uuid := gen_random_uuid();
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles WHERE user_id=v_user AND is_active AND role='manager'
  ) THEN RAISE EXCEPTION 'Manager access required' USING ERRCODE='42501'; END IF;
  -- Serialize with staff actions, which lock the reservation row first.
  PERFORM 1 FROM public.reservation_requests rr
  JOIN public.reservation_alternative_offers ao
    ON ao.reservation_request_id = rr.id
  WHERE ao.id = p_offer_id FOR UPDATE OF rr;
  SELECT * INTO v_offer FROM public.reservation_alternative_offers
   WHERE id=p_offer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found' USING ERRCODE='P0002'; END IF;
  SELECT * INTO v_event FROM public.reservation_notification_events
   WHERE id=v_offer.notification_event_id FOR UPDATE;
  IF v_offer.status <> 'pending' OR v_offer.dispatch_token IS NOT NULL
     OR v_event.notification_status <> 'pending' OR v_event.dispatch_token IS NOT NULL
     OR v_event.twilio_message_sid IS NOT NULL THEN
    RAISE EXCEPTION 'Offer already claimed' USING ERRCODE='22023'; END IF;
  UPDATE public.reservation_alternative_offers
    SET status='dispatching',dispatch_token=v_token WHERE id=p_offer_id;
  UPDATE public.reservation_notification_events
    SET notification_status='unknown',dispatch_token=v_token,
        failure_code='DISPATCH_IN_PROGRESS',updated_at=clock_timestamp()
    WHERE id=v_offer.notification_event_id;
  RETURN QUERY SELECT v_offer.id,v_event.id,v_event.event_key,v_token;
END;
$fn$;

CREATE FUNCTION public.finish_reservation_alternative_offer(
  p_offer_id uuid,p_claim_token uuid,p_result text,p_message_sid text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_offer public.reservation_alternative_offers%ROWTYPE;
  v_event public.reservation_notification_events%ROWTYPE;
  v_at timestamptz := clock_timestamp();
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles WHERE user_id=v_user AND is_active AND role='manager'
  ) THEN RAISE EXCEPTION 'Manager access required' USING ERRCODE='42501'; END IF;
  -- Serialize with staff actions, which lock the reservation row first.
  PERFORM 1 FROM public.reservation_requests rr
  JOIN public.reservation_alternative_offers ao
    ON ao.reservation_request_id = rr.id
  WHERE ao.id = p_offer_id FOR UPDATE OF rr;
  SELECT * INTO v_offer FROM public.reservation_alternative_offers
   WHERE id=p_offer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found' USING ERRCODE='P0002'; END IF;
  SELECT * INTO v_event FROM public.reservation_notification_events
   WHERE id=v_offer.notification_event_id FOR UPDATE;
  IF p_claim_token IS NULL OR v_offer.status <> 'dispatching'
     OR v_offer.dispatch_token IS DISTINCT FROM p_claim_token
     OR v_event.dispatch_token IS DISTINCT FROM p_claim_token
     OR v_event.failure_code <> 'DISPATCH_IN_PROGRESS' THEN
    RAISE EXCEPTION 'Offer claim invalid' USING ERRCODE='22023'; END IF;

  IF p_result = 'accepted' THEN
    IF p_message_sid IS NULL OR p_message_sid !~ '^SM[0-9a-fA-F]{32}$' THEN
      RAISE EXCEPTION 'Valid Twilio SID required' USING ERRCODE='22023'; END IF;
    UPDATE public.reservation_notification_events SET notification_status='sent',
      twilio_message_sid=p_message_sid,failure_code=NULL,failure_description=NULL,
      updated_at=v_at WHERE id=v_event.id;
    UPDATE public.reservation_alternative_offers SET status='sent',sent_at=v_at
      WHERE id=p_offer_id;
    -- This is evidence of Twilio API acceptance, NOT handset delivery.
    UPDATE public.reservation_staff_workflows SET
      workflow_status='alternatives_communicated',
      alternatives_communicated_by=v_user, alternatives_communicated_at=v_at,
      offer_channel='sms',offer_evidence='Twilio accepted SMS '||p_message_sid,
      updated_at=v_at WHERE reservation_request_id=v_offer.reservation_request_id
      AND workflow_status='alternatives_proposed'
      AND proposed_times=v_offer.proposed_times;
    IF NOT FOUND THEN RAISE EXCEPTION 'Workflow changed during dispatch' USING ERRCODE='22023'; END IF;
    RETURN 'sent';
  ELSIF p_result='uncertain' THEN
    UPDATE public.reservation_notification_events SET notification_status='unknown',
      failure_code='SEND_OUTCOME_UNKNOWN',
      failure_description='Review Twilio logs; do not resend automatically.',
      updated_at=v_at WHERE id=v_event.id;
    UPDATE public.reservation_alternative_offers SET status='uncertain' WHERE id=p_offer_id;
    RETURN 'uncertain';
  ELSE RAISE EXCEPTION 'Invalid dispatch result' USING ERRCODE='22023'; END IF;
END;
$fn$;

REVOKE ALL ON FUNCTION public.prepare_reservation_alternative_offer(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.claim_reservation_alternative_offer(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.finish_reservation_alternative_offer(uuid,uuid,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.guard_prepared_alternative_offer() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_reservation_alternative_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_reservation_alternative_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finish_reservation_alternative_offer(uuid,uuid,text,text) TO authenticated;

COMMIT;
