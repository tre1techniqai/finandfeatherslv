-- Fin & Feathers Las Vegas — reservation-only staff workflow
-- LOCAL REVIEW DRAFT. DO NOT APPLY UNTIL APPROVED.
-- Assumes the deployed tables and constraints audited on October 21, 2026.
-- No changes to Twilio ingestion, existing manager endpoints, or existing manager policies.
-- ASSUMPTION TO CONFIRM: valid reservation times are every 30 minutes from
-- 10:00 through 22:00, Las Vegas local time, inclusive.
-- NOTE: Existing requested times are not retroactively constrained.
-- NOTE: Staff-recorded communication/acceptance are attestations, not independent proof.
-- NOTE: Before deployment, validate whether Yelp confirmation numbers are globally unique.
-- NOTE: Final SMS must use COALESCE(workflow.accepted_time, request.reservation_time).
-- NOTE: Notification events are queued only. Dispatch, idempotency, and
-- recovery from uncertain Twilio outcomes must be implemented separately.

BEGIN;

-- 1. Add the restricted role without changing existing manager assignments.
ALTER TABLE public.staff_roles
  DROP CONSTRAINT staff_roles_role_check;
ALTER TABLE public.staff_roles
  ADD CONSTRAINT staff_roles_role_check
  CHECK (role IN ('manager', 'reservation_agent'));

-- Ensure an authenticated employee can read ONLY their own role record.
-- Existing policies remain in place; PostgreSQL combines permissive policies with OR.
DROP POLICY IF EXISTS staff_roles_reservation_self_select ON public.staff_roles;
CREATE POLICY staff_roles_reservation_self_select
  ON public.staff_roles FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 2. Allow the two roles to see reservation requests. No direct staff write policy.
-- Existing manager-only SELECT policy is retained unchanged.
DROP POLICY IF EXISTS reservation_requests_staff_select ON public.reservation_requests;
CREATE POLICY reservation_requests_staff_select
  ON public.reservation_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_roles sr
      WHERE sr.user_id = (SELECT auth.uid())
        AND sr.is_active = true
        AND sr.role IN ('manager', 'reservation_agent')
    )
  );

-- 3. Separate availability/Yelp workflow record. Original request date/time stay immutable.
CREATE TABLE public.reservation_staff_workflows (
  reservation_request_id uuid PRIMARY KEY
    REFERENCES public.reservation_requests(id) ON DELETE CASCADE,
  workflow_status text NOT NULL DEFAULT 'awaiting_review'
    CHECK (workflow_status IN (
      'awaiting_review', 'available', 'unavailable',
      'alternatives_proposed', 'alternatives_communicated',
       'alternative_accepted', 'confirmed'
    )),
  proposed_times time without time zone[] NOT NULL DEFAULT ARRAY[]::time[]
    CHECK (cardinality(proposed_times) <= 3),
  accepted_time time without time zone,
  alternatives_communicated_by uuid REFERENCES auth.users(id),
  alternatives_communicated_at timestamptz,
  offer_channel text CHECK (offer_channel IS NULL OR offer_channel IN ('sms', 'phone', 'email', 'in_person')),
  offer_evidence text CHECK (offer_evidence IS NULL OR length(btrim(offer_evidence)) BETWEEN 10 AND 500),
  yelp_confirmation_number text,
  availability_reviewed_by uuid REFERENCES auth.users(id),
  availability_reviewed_at timestamptz,
  alternative_accepted_by uuid REFERENCES auth.users(id),
  alternative_accepted_at timestamptz,
  -- Required evidence of guest acceptance, attested by the acting staff member.
  acceptance_channel text CHECK (
    acceptance_channel IS NULL OR
    acceptance_channel IN ('sms', 'phone', 'in_person', 'email')
  ),
  acceptance_evidence text CHECK (
    acceptance_evidence IS NULL OR
    length(btrim(acceptance_evidence)) BETWEEN 10 AND 500
  ),
  deposit_verified_by uuid REFERENCES auth.users(id),
  deposit_verified_at timestamptz,
  yelp_confirmed_by uuid REFERENCES auth.users(id),
  yelp_confirmed_at timestamptz,
  -- Transactional audit events; only the guarded RPC may append to this array.
  activity_log jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(activity_log) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservation_workflow_yelp_number_check
    CHECK (yelp_confirmation_number IS NULL OR (
      length(btrim(yelp_confirmation_number)) BETWEEN 1 AND 100
    )),
  CONSTRAINT reservation_workflow_confirmed_check
    CHECK (workflow_status <> 'confirmed' OR (
      yelp_confirmation_number IS NOT NULL AND yelp_confirmed_by IS NOT NULL
      AND yelp_confirmed_at IS NOT NULL
    )),
  CONSTRAINT reservation_workflow_communicated_check
    CHECK (workflow_status NOT IN ('alternatives_communicated', 'alternative_accepted') OR (
      alternatives_communicated_by IS NOT NULL AND alternatives_communicated_at IS NOT NULL
      AND offer_channel IS NOT NULL AND offer_evidence IS NOT NULL
    )),
  CONSTRAINT reservation_workflow_accepted_time_check
    CHECK (workflow_status <> 'alternative_accepted' OR (
      accepted_time IS NOT NULL AND alternative_accepted_by IS NOT NULL
      AND alternative_accepted_at IS NOT NULL
      AND acceptance_channel IS NOT NULL AND acceptance_evidence IS NOT NULL
    )),
  CONSTRAINT reservation_workflow_time_window_check
    CHECK (
      (accepted_time IS NULL OR (
        accepted_time BETWEEN TIME '10:00' AND TIME '22:00'
        AND EXTRACT(MINUTE FROM accepted_time) IN (0, 30)
        AND EXTRACT(SECOND FROM accepted_time) = 0
      ))
    )
);

-- Review with Yelp operator: this assumes confirmation numbers identify distinct bookings.
CREATE UNIQUE INDEX reservation_staff_workflows_yelp_reference_unique
  ON public.reservation_staff_workflows (yelp_confirmation_number)
  WHERE yelp_confirmation_number IS NOT NULL;

ALTER TABLE public.reservation_staff_workflows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.reservation_staff_workflows FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.reservation_staff_workflows TO authenticated;

CREATE POLICY reservation_staff_workflows_select
  ON public.reservation_staff_workflows FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_roles sr
      WHERE sr.user_id = (SELECT auth.uid())
        AND sr.is_active = true
        AND sr.role IN ('manager', 'reservation_agent')
    )
  );

-- 4. Add final guest-notification event type without altering existing event records.
ALTER TABLE public.reservation_notification_events
  DROP CONSTRAINT reservation_notification_type_check;
ALTER TABLE public.reservation_notification_events
  ADD CONSTRAINT reservation_notification_type_check
  CHECK (notification_type IN (
    'new_reservation', 'incomplete_reservation',
    'unvalidated_reservation', 'reservation_confirmed'
  ));

-- 5. One guarded mutation surface. Only this function changes reservation staff workflow.
-- SMS is intentionally NOT sent here; the event is only queued for a future sender.
CREATE OR REPLACE FUNCTION public.apply_reservation_staff_action(
  p_reservation_id uuid,
  p_action text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  reservation_id uuid,
  workflow_status text,
  request_status text,
  deposit_status text,
  notification_event_key text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_role text;
  v_req public.reservation_requests%ROWTYPE;
  v_workflow public.reservation_staff_workflows%ROWTYPE;
  v_action text := lower(btrim(coalesce(p_action, '')));
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_times time without time zone[];
  v_time_text text;
  v_time time without time zone;
  v_confirm text;
  v_acceptance_channel text;
  v_acceptance_evidence text;
  v_offer_channel text;
  v_offer_evidence text;
  v_expected_deposit numeric(10,2);
  v_at timestamptz;
  v_event_key text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Reservation staff authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT sr.role INTO v_role
  FROM public.staff_roles sr
  WHERE sr.user_id = v_user_id
    AND sr.is_active = true
    AND sr.role IN ('manager', 'reservation_agent')
  FOR SHARE;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Reservation staff authorization required' USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR v_action NOT IN (
    'approve_availability', 'decline_availability', 'propose_alternatives',
    'record_alternative_offer', 'accept_alternative',
    'verify_deposit', 'confirm_yelp_booking'
  ) THEN
    RAISE EXCEPTION 'Unsupported reservation or action' USING ERRCODE = '22023';
  END IF;

  IF jsonb_typeof(v_payload) <> 'object' OR length(v_payload::text) > 5000 THEN
    RAISE EXCEPTION 'Invalid action payload' USING ERRCODE = '22023';
  END IF;

  -- Serialize all actions on this reservation, including the initial workflow insertion.
  SELECT * INTO v_req FROM public.reservation_requests rr
  WHERE rr.id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
  END IF;

  -- Record the actual action time after waiting for any reservation lock.
  v_at := clock_timestamp();

  IF v_req.request_status = 'closed' THEN
    RAISE EXCEPTION 'Closed reservation cannot be modified' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.reservation_staff_workflows (reservation_request_id)
  VALUES (p_reservation_id)
  ON CONFLICT (reservation_request_id) DO NOTHING;

  SELECT * INTO v_workflow FROM public.reservation_staff_workflows sw
  WHERE sw.reservation_request_id = p_reservation_id FOR UPDATE;

  IF v_req.request_status = 'confirmed' OR v_workflow.workflow_status = 'confirmed' THEN
    RAISE EXCEPTION 'Reservation is already confirmed' USING ERRCODE = '22023';
  END IF;

  IF v_req.request_status NOT IN ('pending', 'incomplete')
     OR NOT v_req.details_validated
     OR nullif(btrim(v_req.customer_name), '') IS NULL
     OR v_req.reservation_date IS NULL OR v_req.reservation_time IS NULL
     OR v_req.party_size NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'Reservation requires validated details before staff processing'
      USING ERRCODE = '22023';
  END IF;

  IF v_req.party_size BETWEEN 9 AND 10 THEN
    v_expected_deposit := 55;
  ELSIF v_req.party_size BETWEEN 11 AND 14 THEN
    v_expected_deposit := 80;
  ELSIF v_req.party_size BETWEEN 15 AND 20 THEN
    v_expected_deposit := 110;
  ELSE
    v_expected_deposit := NULL;
  END IF;

  IF v_action = 'approve_availability' THEN
    IF v_workflow.workflow_status NOT IN ('awaiting_review', 'unavailable', 'available') THEN
      RAISE EXCEPTION 'Availability decision is not eligible' USING ERRCODE = '22023';
    END IF;
    UPDATE public.reservation_staff_workflows
    SET workflow_status = 'available', proposed_times = ARRAY[]::time[],
        accepted_time = NULL, alternative_accepted_by = NULL, alternative_accepted_at = NULL,
        acceptance_channel = NULL, acceptance_evidence = NULL,
        availability_reviewed_by = v_user_id, availability_reviewed_at = v_at,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

  ELSIF v_action = 'decline_availability' THEN
    IF v_workflow.workflow_status NOT IN ('awaiting_review', 'available', 'unavailable', 'alternatives_proposed') THEN
      RAISE EXCEPTION 'Availability decision is not eligible' USING ERRCODE = '22023';
    END IF;
    UPDATE public.reservation_staff_workflows
    SET workflow_status = 'unavailable', proposed_times = ARRAY[]::time[],
        accepted_time = NULL, alternative_accepted_by = NULL, alternative_accepted_at = NULL,
        acceptance_channel = NULL, acceptance_evidence = NULL,
        availability_reviewed_by = v_user_id, availability_reviewed_at = v_at,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

  ELSIF v_action = 'propose_alternatives' THEN
    IF v_workflow.workflow_status NOT IN ('unavailable', 'alternatives_proposed') THEN
      RAISE EXCEPTION 'Decline availability before proposing alternatives' USING ERRCODE = '22023';
    END IF;
    IF jsonb_typeof(v_payload->'times') IS DISTINCT FROM 'array'
       OR jsonb_array_length(v_payload->'times') NOT BETWEEN 1 AND 3 THEN
      RAISE EXCEPTION 'Provide one to three alternative times' USING ERRCODE = '22023';
    END IF;
    v_times := ARRAY[]::time[];
    FOR v_time_text IN SELECT jsonb_array_elements_text(v_payload->'times') LOOP
      IF v_time_text !~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$' THEN
        RAISE EXCEPTION 'Times must use HH:MM format' USING ERRCODE = '22023';
      END IF;
      v_time := v_time_text::time;
      IF v_time < TIME '10:00' OR v_time > TIME '22:00'
         OR EXTRACT(MINUTE FROM v_time) NOT IN (0, 30) THEN
        RAISE EXCEPTION 'Alternatives must be in 30-minute steps from 10:00 to 22:00 Las Vegas time'
          USING ERRCODE = '22023';
      END IF;
      IF v_time = v_req.reservation_time THEN
        RAISE EXCEPTION 'An alternative must differ from the originally requested time'
          USING ERRCODE = '22023';
      END IF;
      IF v_time = ANY(v_times) THEN
        RAISE EXCEPTION 'Alternative times must be unique' USING ERRCODE = '22023';
      END IF;
      v_times := array_append(v_times, v_time);
    END LOOP;
    UPDATE public.reservation_staff_workflows
    SET workflow_status = 'alternatives_proposed', proposed_times = v_times,
        accepted_time = NULL, alternative_accepted_by = NULL, alternative_accepted_at = NULL,
        acceptance_channel = NULL, acceptance_evidence = NULL,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

  ELSIF v_action = 'record_alternative_offer' THEN
    -- This is a staff attestation that the offered times were actually
    -- communicated. Merely saving suggested times is not an offer.
    IF v_workflow.workflow_status <> 'alternatives_proposed' THEN
      RAISE EXCEPTION 'Save alternative times before recording the offer' USING ERRCODE = '22023';
    END IF;
    v_offer_channel := nullif(btrim(v_payload->>'offer_channel'), '');
    v_offer_evidence := nullif(btrim(v_payload->>'offer_evidence'), '');
    IF v_payload->>'offer_communicated' IS DISTINCT FROM 'true'
       OR v_offer_channel IS NULL OR v_offer_channel NOT IN ('sms', 'phone', 'email', 'in_person')
       OR v_offer_evidence IS NULL OR length(v_offer_evidence) NOT BETWEEN 10 AND 500
       OR v_offer_evidence ~ '[[:cntrl:]]' THEN
      RAISE EXCEPTION 'Confirm and document actual communication of the alternatives'
        USING ERRCODE = '22023';
    END IF;
    UPDATE public.reservation_staff_workflows
    SET workflow_status = 'alternatives_communicated',
        alternatives_communicated_by = v_user_id,
        alternatives_communicated_at = v_at,
        offer_channel = v_offer_channel, offer_evidence = v_offer_evidence,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

  ELSIF v_action = 'accept_alternative' THEN
    IF v_workflow.workflow_status <> 'alternatives_communicated' THEN
      RAISE EXCEPTION 'Alternatives must be communicated before acceptance' USING ERRCODE = '22023';
    END IF;
    v_time_text := v_payload->>'accepted_time';
    IF v_time_text IS NULL OR v_time_text !~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$' THEN
      RAISE EXCEPTION 'A valid proposed time is required' USING ERRCODE = '22023';
    END IF;
    v_time := v_time_text::time;
    IF NOT (v_time = ANY(v_workflow.proposed_times))
       OR v_payload->>'guest_acceptance_verified' IS DISTINCT FROM 'true' THEN
      RAISE EXCEPTION 'Guest acceptance must be independently verified' USING ERRCODE = '22023';
    END IF;
    v_acceptance_channel := nullif(btrim(v_payload->>'acceptance_channel'), '');
    v_acceptance_evidence := nullif(btrim(v_payload->>'acceptance_evidence'), '');
    IF v_acceptance_channel IS NULL OR v_acceptance_channel NOT IN
       ('sms', 'phone', 'in_person', 'email')
       OR v_acceptance_evidence IS NULL
       OR length(v_acceptance_evidence) NOT BETWEEN 10 AND 500
       OR v_acceptance_evidence ~ '[[:cntrl:]]' THEN
      RAISE EXCEPTION 'Document the guest acceptance channel and evidence (10-500 characters)'
        USING ERRCODE = '22023';
    END IF;
    UPDATE public.reservation_staff_workflows
    SET workflow_status = 'alternative_accepted', accepted_time = v_time,
        alternative_accepted_by = v_user_id, alternative_accepted_at = v_at,
        acceptance_channel = v_acceptance_channel,
        acceptance_evidence = v_acceptance_evidence,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

  ELSIF v_action = 'verify_deposit' THEN
    IF v_expected_deposit IS NULL
       OR v_req.deposit_amount IS DISTINCT FROM v_expected_deposit
       OR v_req.deposit_status <> 'pending'
       OR v_payload->>'payment_independently_verified' IS DISTINCT FROM 'true' THEN
      RAISE EXCEPTION 'Deposit verification requirements not satisfied' USING ERRCODE = '22023';
    END IF;
    UPDATE public.reservation_requests
    SET deposit_status = 'verified', updated_at = v_at
    WHERE id = p_reservation_id;
    UPDATE public.reservation_staff_workflows
    SET deposit_verified_by = v_user_id, deposit_verified_at = v_at,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

  ELSIF v_action = 'confirm_yelp_booking' THEN
    IF v_workflow.workflow_status NOT IN ('available', 'alternative_accepted') THEN
      RAISE EXCEPTION 'Availability or guest acceptance not yet established' USING ERRCODE = '22023';
    END IF;
    v_confirm := nullif(btrim(v_payload->>'yelp_confirmation_number'), '');
    IF v_confirm IS NULL OR length(v_confirm) > 100
       OR v_confirm ~ '[[:cntrl:]]' THEN
      RAISE EXCEPTION 'Valid Yelp confirmation number is required' USING ERRCODE = '22023';
    END IF;
    IF (v_expected_deposit IS NULL AND (
          v_req.deposit_amount IS NOT NULL OR v_req.deposit_status <> 'not_required'
        )) OR (v_expected_deposit IS NOT NULL AND (
          v_req.deposit_amount IS DISTINCT FROM v_expected_deposit
          OR v_req.deposit_status <> 'verified'
        )) THEN
      RAISE EXCEPTION 'Deposit requirements not satisfied' USING ERRCODE = '22023';
    END IF;

    UPDATE public.reservation_staff_workflows
    SET workflow_status = 'confirmed', yelp_confirmation_number = v_confirm,
        yelp_confirmed_by = v_user_id, yelp_confirmed_at = v_at,
        updated_at = v_at
    WHERE reservation_request_id = p_reservation_id;

    -- The original requested time remains intact. If an alternative was accepted,
    -- its confirmed time is held in reservation_staff_workflows.accepted_time.
    UPDATE public.reservation_requests
    SET request_status = 'confirmed', confirmed_at = v_at, updated_at = v_at
    WHERE id = p_reservation_id;

    v_event_key := 'reservation_confirmed:' || p_reservation_id::text;
    INSERT INTO public.reservation_notification_events (
      reservation_request_id, event_key, notification_type, notification_status
    ) VALUES (
      p_reservation_id, v_event_key, 'reservation_confirmed', 'pending'
    ) ON CONFLICT (event_key) DO NOTHING;
  END IF;

  -- Append an audit event under the reservation row lock.
  -- Guard against an unbounded JSONB array; redesign as append-only events
  -- before this cap is approached.
  IF jsonb_array_length(v_workflow.activity_log) >= 500 THEN
    RAISE EXCEPTION 'Staff activity audit limit reached; contact an administrator'
      USING ERRCODE = '54000';
  END IF;

  -- Append an immutable-in-practice event under the reservation row lock.
  -- Client role cannot UPDATE this table directly; RPC controls all writes.
  UPDATE public.reservation_staff_workflows AS sw
  SET activity_log = sw.activity_log || jsonb_build_array(jsonb_build_object(
        'at', v_at, 'staff_user_id', v_user_id, 'action', v_action,
        'status', sw.workflow_status,
        'accepted_time', CASE WHEN v_action = 'accept_alternative' THEN v_time::text ELSE NULL END,
        'proposed_times', CASE WHEN v_action = 'propose_alternatives' THEN to_jsonb(v_times) ELSE NULL END,
        'acceptance_channel', CASE WHEN v_action = 'accept_alternative' THEN v_acceptance_channel ELSE NULL END,
        'acceptance_evidence', CASE WHEN v_action = 'accept_alternative' THEN v_acceptance_evidence ELSE NULL END
      )),
      updated_at = v_at
  WHERE reservation_request_id = p_reservation_id;

  RETURN QUERY
  SELECT p_reservation_id, sw.workflow_status, rr.request_status,
         rr.deposit_status, v_event_key
  FROM public.reservation_staff_workflows sw
  JOIN public.reservation_requests rr ON rr.id = sw.reservation_request_id
  WHERE sw.reservation_request_id = p_reservation_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_reservation_staff_action(uuid, text, jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_reservation_staff_action(uuid, text, jsonb)
  TO authenticated;

COMMENT ON FUNCTION public.apply_reservation_staff_action(uuid, text, jsonb) IS
  'Authorized reservation-staff state changes only. Creates but does not send confirmation SMS events.';

COMMIT;