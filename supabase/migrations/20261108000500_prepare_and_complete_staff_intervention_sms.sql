-- Stage 1.79C: one-time prepared revised availability SMS, using existing staff SMS ledger.
-- No table additions.  No changes to the original alternative offer workflow.
-- IMPORTANT: do not expose send UI until Stage 1.79D (guest replies/resolution) is deployed.
BEGIN;

CREATE FUNCTION public.prepare_reservation_staff_intervention_sms(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_intervention_id uuid
)
RETURNS TABLE(client_request_id uuid, message_body text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_res public.reservation_requests%ROWTYPE;
  v_conv public.reservation_shared_conversations%ROWTYPE;
  v_inter public.reservation_staff_interventions%ROWTYPE;
  v_times text[];
  v_time text;
  v_body text;
  v_key uuid;
  v_choice integer := 0;
BEGIN
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles WHERE user_id = v_actor
    AND is_active = true AND role IN ('manager','reservation_agent')
  ) THEN
    RAISE EXCEPTION 'Reservation staff access required' USING ERRCODE = '42501';
  END IF;
  IF p_reservation_id IS NULL OR p_conversation_id IS NULL
     OR p_expected_mode_version IS NULL OR p_expected_mode_version < 1
     OR p_intervention_id IS NULL THEN
    RAISE EXCEPTION 'Invalid intervention send request' USING ERRCODE = '22023';
  END IF;

  -- Match shared SMS locking: conversation -> reservation -> intervention.
  SELECT * INTO v_conv FROM public.reservation_shared_conversations
   WHERE id = p_conversation_id AND reservation_request_id = p_reservation_id
   FOR UPDATE;
  IF NOT FOUND OR v_conv.mode <> 'staff'
     OR v_conv.mode_version <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Verified staff mode is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_res FROM public.reservation_requests
   WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR v_res.request_status NOT IN ('pending','incomplete')
     OR v_res.details_validated IS DISTINCT FROM true
     OR v_res.reservation_date IS NULL THEN
    RAISE EXCEPTION 'Reservation is not eligible' USING ERRCODE = '22023';
  END IF;
  -- A legacy alternative offer uses a different acceptance and reply contract.
  -- Do not dispatch a second competing numbered offer to the same reservation.
  IF EXISTS (
    SELECT 1 FROM public.reservation_alternative_offers
    WHERE reservation_request_id = p_reservation_id
  ) THEN
    RAISE EXCEPTION 'Existing alternative offer requires staff reconciliation before revised-time SMS'
      USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_inter FROM public.reservation_staff_interventions
   WHERE id = p_intervention_id AND reservation_request_id = p_reservation_id
     AND conversation_id = p_conversation_id AND intervention_type = 'revised_availability'
   FOR UPDATE;
  IF NOT FOUND OR v_inter.status <> 'draft'
     OR v_inter.mode_version_at_start <> p_expected_mode_version
     OR v_inter.resolution IS NOT NULL
     OR v_inter.details ? 'send_claim' THEN
    RAISE EXCEPTION 'Draft is not available for a new send. Never retry an uncertain message.'
      USING ERRCODE = '55000';
  END IF;
  IF (v_inter.details ? 'revised_times') IS FALSE
     OR jsonb_typeof(v_inter.details -> 'revised_times') <> 'array'
     OR jsonb_array_length(v_inter.details -> 'revised_times') NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'Save 1–3 revised times first' USING ERRCODE = '22023';
  END IF;
  SELECT array_agg(value ORDER BY ordinality) INTO v_times
    FROM jsonb_array_elements_text(v_inter.details -> 'revised_times')
      WITH ORDINALITY AS options(value, ordinality);
  IF cardinality(v_times) <> (SELECT count(DISTINCT t) FROM unnest(v_times) t) THEN
    RAISE EXCEPTION 'Duplicate revised time' USING ERRCODE = '22023';
  END IF;
  FOREACH v_time IN ARRAY v_times LOOP
    IF v_time !~ '^(1[0-9]|2[0-1]):(00|30)$|^22:00$'
      OR (v_res.reservation_date + v_time::time)
          AT TIME ZONE 'America/Los_Angeles' < clock_timestamp() + interval '2 hours' THEN
      RAISE EXCEPTION 'One or more saved times are no longer valid' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  -- The existing shared SMS sender independently enforces staff mode,
  -- active manager/reservation_agent authorization, and reservation identity.
  -- One-time intervention claim remains bound to this authenticated actor.

  v_body := 'Fin & Feathers Las Vegas: Revised time options for your reservation on '
    || to_char(v_res.reservation_date, 'MM/DD/YYYY') || ':';
  FOREACH v_time IN ARRAY v_times LOOP
    v_choice := v_choice + 1;
    v_body := v_body || E'\n' || v_choice::text || ') '
      || to_char(v_time::time, 'FMHH12:MI AM');
  END LOOP;
  v_body := v_body || E'\nReply with your preferred option number. '
    || 'Our team will review your choice. Your reservation is NOT YET CONFIRMED.';
  IF char_length(v_body) > 1600 THEN
    RAISE EXCEPTION 'Message body exceeds SMS limit' USING ERRCODE = '22023';
  END IF;
  v_key := gen_random_uuid();
  UPDATE public.reservation_staff_interventions
   SET details = details || jsonb_build_object('send_claim', jsonb_build_object(
     'client_request_id', v_key,
     'message_body', v_body,
     'reservation_date', v_res.reservation_date,
     'claimed_by', v_actor,
     'claimed_at', clock_timestamp()
   )), updated_at = clock_timestamp()
   WHERE id = p_intervention_id AND status = 'draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'Draft changed' USING ERRCODE = '55000'; END IF;
  RETURN QUERY SELECT v_key, v_body;
END;
$function$;

CREATE FUNCTION public.complete_reservation_staff_intervention_sms(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_intervention_id uuid,
  p_client_request_id uuid
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_conv public.reservation_shared_conversations%ROWTYPE;
  v_inter public.reservation_staff_interventions%ROWTYPE;
  v_op public.reservation_shared_sms_operations%ROWTYPE;
  v_claim jsonb;
BEGIN
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles WHERE user_id = v_actor
      AND is_active = true AND role IN ('manager','reservation_agent')
  ) THEN
    RAISE EXCEPTION 'Reservation staff access required' USING ERRCODE = '42501';
  END IF;
  IF p_reservation_id IS NULL OR p_conversation_id IS NULL
     OR p_intervention_id IS NULL OR p_client_request_id IS NULL
     OR p_expected_mode_version IS NULL OR p_expected_mode_version < 1 THEN
    RAISE EXCEPTION 'Invalid completion request' USING ERRCODE = '22023';
  END IF;
  -- Preserve shared-SMS conversation-first lock ordering.
  SELECT * INTO v_conv FROM public.reservation_shared_conversations
    WHERE id = p_conversation_id AND reservation_request_id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR v_conv.mode <> 'staff' OR v_conv.mode_version <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Staff ownership changed' USING ERRCODE = '55000';
  END IF;
  PERFORM 1 FROM public.reservation_requests WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_inter FROM public.reservation_staff_interventions
    WHERE id = p_intervention_id AND reservation_request_id = p_reservation_id
      AND conversation_id = p_conversation_id AND intervention_type = 'revised_availability'
    FOR UPDATE;
  IF NOT FOUND OR v_inter.mode_version_at_start <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Intervention mismatch' USING ERRCODE = '22023';
  END IF;
  v_claim := v_inter.details -> 'send_claim';
  IF v_claim IS NULL OR (v_claim ->> 'client_request_id') IS DISTINCT FROM p_client_request_id::text
     OR (v_claim ->> 'claimed_by') IS DISTINCT FROM v_actor::text THEN
    RAISE EXCEPTION 'Message claim mismatch' USING ERRCODE = '22023';
  END IF;
  IF v_inter.status = 'awaiting_guest' THEN
    RETURN 'awaiting_guest';
  END IF;
  IF v_inter.status <> 'draft' THEN
    RAISE EXCEPTION 'Intervention is not a draft' USING ERRCODE = '55000';
  END IF;
  SELECT * INTO v_op FROM public.reservation_shared_sms_operations
    WHERE conversation_id = p_conversation_id
      AND reservation_request_id = p_reservation_id
      AND client_request_id = p_client_request_id AND manager_id = v_actor
    FOR UPDATE;
  IF NOT FOUND OR v_op.status <> 'accepted'
     OR v_op.twilio_message_sid IS NULL
     OR v_op.message_body IS DISTINCT FROM (v_claim ->> 'message_body') THEN
    RAISE EXCEPTION 'Twilio acceptance is not verified; manual reconciliation required'
      USING ERRCODE = '55000';
  END IF;
  UPDATE public.reservation_staff_interventions
    SET status = 'awaiting_guest', updated_at = clock_timestamp(),
        details = details || jsonb_build_object('outbound_message_sid', v_op.twilio_message_sid,
                                                'outbound_operation_id', v_op.id)
    WHERE id = p_intervention_id AND status = 'draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'Intervention changed' USING ERRCODE = '55000'; END IF;
  RETURN 'awaiting_guest';
END;
$function$;

REVOKE ALL ON FUNCTION public.prepare_reservation_staff_intervention_sms(uuid,uuid,bigint,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_reservation_staff_intervention_sms(uuid,uuid,bigint,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.complete_reservation_staff_intervention_sms(uuid,uuid,bigint,uuid,uuid) FROM PUBLIC,anon,authenticated;GRANT EXECUTE ON FUNCTION public.complete_reservation_staff_intervention_sms(uuid,uuid,bigint,uuid,uuid) TO authenticated;
COMMIT;