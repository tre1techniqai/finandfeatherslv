-- Fin & Feathers Las Vegas: process replies to alternative-time offers.
-- STAGED DRAFT. Apply only after 20261022000400_alternative_offer_delivery.sql
-- has been reviewed, tested and applied. Do not deploy independently.
--
-- Called from a trusted Twilio Function using a Supabase service-role client.
-- A guest's '1', '2', or '3' selects an offered time on the ORIGINAL date.
-- This does not confirm a Yelp booking or send any SMS.
BEGIN;

-- Existing workflow check assumes staff manually recorded every acceptance.
-- Allow automated SMS acceptance with no staff actor, but still require the
-- timestamp, selected time, communication channel, and evidence.
ALTER TABLE public.reservation_staff_workflows
  DROP CONSTRAINT reservation_workflow_accepted_time_check;
ALTER TABLE public.reservation_staff_workflows
  ADD CONSTRAINT reservation_workflow_accepted_time_check CHECK (
    workflow_status <> 'alternative_accepted' OR (
      accepted_time IS NOT NULL
      AND alternative_accepted_at IS NOT NULL
      AND acceptance_channel IS NOT NULL
      AND acceptance_evidence IS NOT NULL
      AND (
        alternative_accepted_by IS NOT NULL
        OR (
          alternative_accepted_by IS NULL
          AND acceptance_channel = 'sms'
          AND acceptance_evidence ~ '^Twilio inbound SMS SM[0-9a-fA-F]{32}$'
        )
      )
    )
  );

CREATE OR REPLACE FUNCTION public.record_reservation_alternative_reply(
  p_customer_phone text,
  p_inbound_message_sid text,
  p_reply text
)
RETURNS TABLE (
  outcome text,
  reservation_id uuid,
  offer_id uuid,
  accepted_time text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_offer public.reservation_alternative_offers%ROWTYPE;
  v_workflow public.reservation_staff_workflows%ROWTYPE;
  v_choice integer;
  v_time time without time zone;
  v_count integer;
  v_at timestamptz;
BEGIN
  -- This RPC is exclusively for backend ingestion, not browser or anon users.
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service role required' USING ERRCODE = '42501';
  END IF;

  IF p_customer_phone IS NULL
     OR p_customer_phone !~ '^\+[1-9][0-9]{7,14}$'
     OR p_inbound_message_sid IS NULL
     OR p_inbound_message_sid !~ '^SM[0-9a-fA-F]{32}$'
     OR p_reply IS NULL OR length(p_reply) > 100 THEN
    RAISE EXCEPTION 'Invalid inbound message information' USING ERRCODE = '22023';
  END IF;

  -- Serialize replies for a sender before checking for an already accepted
  -- Message SID or locating a live offer. This prevents two different inbound
  -- Message SIDs from accepting the same offer concurrently, and ensures
  -- repeat webhook deliveries observe the committed result.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_customer_phone, 8242)
  );

  -- Duplicate Twilio delivery or webhook replay is always harmless.
  SELECT count(*) INTO v_count
  FROM public.reservation_alternative_offers ao
  JOIN public.reservation_requests rr ON rr.id = ao.reservation_request_id
  WHERE rr.customer_phone = p_customer_phone
    AND ao.inbound_message_sid = p_inbound_message_sid;

  IF v_count > 1 THEN
    RAISE EXCEPTION 'Conflicting inbound message SID records' USING ERRCODE = '22023';
  END IF;

  IF v_count = 1 THEN
    RETURN QUERY SELECT 'duplicate'::text, ao.reservation_request_id,
                        ao.id, ao.accepted_time::text
    FROM public.reservation_alternative_offers ao
    JOIN public.reservation_requests rr ON rr.id = ao.reservation_request_id
    WHERE rr.customer_phone = p_customer_phone
      AND ao.inbound_message_sid = p_inbound_message_sid;
    RETURN;
  END IF;

  -- Refuse to interpret an SMS when the same phone has multiple live offers.
  -- This protects guests with multiple reservation requests.
  SELECT count(*) INTO v_count
  FROM public.reservation_alternative_offers ao
  JOIN public.reservation_requests rr ON rr.id = ao.reservation_request_id
  JOIN public.reservation_staff_workflows sw
    ON sw.reservation_request_id = rr.id
  WHERE rr.customer_phone = p_customer_phone
    AND rr.request_status IN ('pending', 'incomplete')
    AND ao.status = 'sent'
    AND sw.workflow_status = 'alternatives_communicated';

  IF v_count = 0 THEN
    -- A completed conversation remains recognizable for 24 hours.
    -- Do not redirect a follow-up such as 'Thanks' into the parser.
    -- The Twilio router separately permits structured new-reservation texts.
    SELECT count(*) INTO v_count
    FROM public.reservation_alternative_offers ao
    JOIN public.reservation_requests rr ON rr.id = ao.reservation_request_id
    WHERE rr.customer_phone = p_customer_phone
      AND ao.status = 'accepted'
      AND ao.accepted_at > clock_timestamp() - INTERVAL '24 hours';

    IF v_count > 0 THEN
      RETURN QUERY SELECT 'recently_accepted'::text,
        NULL::uuid, NULL::uuid, NULL::text;
    ELSE
      RETURN QUERY SELECT 'no_active_offer'::text,
        NULL::uuid, NULL::uuid, NULL::text;
    END IF;
    RETURN;
  ELSIF v_count > 1 THEN
    RETURN QUERY SELECT 'ambiguous_offer'::text, NULL::uuid, NULL::uuid, NULL::text;
    RETURN;
  END IF;

  -- Lock parent reservation first (same order as staff workflow mutations).
  PERFORM 1 FROM public.reservation_requests rr
  JOIN public.reservation_alternative_offers ao ON ao.reservation_request_id = rr.id
  JOIN public.reservation_staff_workflows sw ON sw.reservation_request_id = rr.id
  WHERE rr.customer_phone = p_customer_phone
    AND rr.request_status IN ('pending', 'incomplete')
    AND ao.status = 'sent'
    AND sw.workflow_status = 'alternatives_communicated'
  FOR UPDATE OF rr;

  SELECT ao.* INTO v_offer
  FROM public.reservation_alternative_offers ao
  JOIN public.reservation_requests rr ON rr.id = ao.reservation_request_id
  JOIN public.reservation_staff_workflows sw ON sw.reservation_request_id = rr.id
  WHERE rr.customer_phone = p_customer_phone
    AND rr.request_status IN ('pending', 'incomplete')
    AND ao.status = 'sent'
    AND sw.workflow_status = 'alternatives_communicated'
  FOR UPDATE OF ao;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'no_active_offer'::text, NULL::uuid, NULL::uuid, NULL::text;
    RETURN;
  END IF;

  SELECT * INTO v_workflow FROM public.reservation_staff_workflows sw
  WHERE sw.reservation_request_id = v_offer.reservation_request_id
  FOR UPDATE;

  IF v_workflow.workflow_status <> 'alternatives_communicated'
     OR v_workflow.proposed_times IS DISTINCT FROM v_offer.proposed_times THEN
    RETURN QUERY SELECT 'no_active_offer'::text, NULL::uuid, NULL::uuid, NULL::text;
    RETURN;
  END IF;

  IF btrim(p_reply) !~ '^[1-3]$' THEN
    RETURN QUERY SELECT 'invalid_selection'::text,
      v_offer.reservation_request_id, v_offer.id, NULL::text;
    RETURN;
  END IF;

  v_choice := btrim(p_reply)::integer;
  IF v_choice > cardinality(v_offer.proposed_times) THEN
    RETURN QUERY SELECT 'invalid_selection'::text,
      v_offer.reservation_request_id, v_offer.id, NULL::text;
    RETURN;
  END IF;

  v_time := v_offer.proposed_times[v_choice];
  v_at := clock_timestamp();

  UPDATE public.reservation_alternative_offers ao
  SET status = 'accepted', accepted_time = v_time,
      inbound_message_sid = p_inbound_message_sid, accepted_at = v_at
  WHERE ao.id = v_offer.id AND ao.status = 'sent';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer state changed' USING ERRCODE = '22023';
  END IF;

  UPDATE public.reservation_staff_workflows sw
  SET workflow_status = 'alternative_accepted',
      accepted_time = v_time,
      alternative_accepted_at = v_at,
      -- Trusted inbound Twilio reply is evidence of acceptance.
      -- No staff user initiated this change.
      alternative_accepted_by = NULL,
      acceptance_channel = 'sms',
      acceptance_evidence = 'Twilio inbound SMS ' || p_inbound_message_sid,
      updated_at = v_at,
      activity_log = sw.activity_log || jsonb_build_array(jsonb_build_object(
        'at', v_at,
        'action', 'guest_accepted_alternative_by_sms',
        'offer_id', v_offer.id,
        'inbound_message_sid', p_inbound_message_sid,
        'accepted_time', v_time::text
      ))
  WHERE sw.reservation_request_id = v_offer.reservation_request_id
    AND sw.workflow_status = 'alternatives_communicated'
    AND jsonb_array_length(sw.activity_log) < 500;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow state changed or audit limit reached'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY SELECT 'accepted'::text, v_offer.reservation_request_id,
                      v_offer.id, v_time::text;
END;
$fn$;

REVOKE ALL ON FUNCTION public.record_reservation_alternative_reply(text,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_reservation_alternative_reply(text,text,text)
  TO service_role;

COMMIT;
