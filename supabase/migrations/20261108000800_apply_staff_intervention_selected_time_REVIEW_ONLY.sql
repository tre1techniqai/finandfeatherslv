-- Stage 1.79D3: narrowly scoped atomic delegate to the EXISTING amendment
-- function. No new tables, no original-alternative-offer state changes.
-- An existing prepared legacy alternative offer will be refused by the
-- underlying amend_reservation_datetime() protection (intentional).
-- REVIEW ONLY; first deploy all prerequisite 005-007 functions.
BEGIN;
CREATE FUNCTION public.apply_verified_staff_intervention_selected_time(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_intervention_id uuid
)
RETURNS TABLE(reservation_id uuid, reservation_date date,
              reservation_time time without time zone, workflow_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_res public.reservation_requests%ROWTYPE;
  v_conv public.reservation_shared_conversations%ROWTYPE;
  v_inter public.reservation_staff_interventions%ROWTYPE;
  v_choice text;
  v_result record;
BEGIN
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = v_actor AND is_active = true
      AND role IN ('manager', 'reservation_agent')
  ) THEN RAISE EXCEPTION 'Reservation staff authorization required' USING ERRCODE = '42501'; END IF;
  IF p_reservation_id IS NULL OR p_conversation_id IS NULL
     OR p_expected_mode_version IS NULL OR p_expected_mode_version < 1
     OR p_intervention_id IS NULL THEN
    RAISE EXCEPTION 'Invalid intervention amendment' USING ERRCODE = '22023';
  END IF;

  -- Match shared lock order: conversation, reservation, intervention.
  SELECT * INTO v_conv FROM public.reservation_shared_conversations c
    WHERE c.id = p_conversation_id AND c.reservation_request_id = p_reservation_id
    FOR UPDATE;
  IF NOT FOUND OR v_conv.mode <> 'staff' OR
     v_conv.mode_version <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Current staff conversation ownership required' USING ERRCODE = '55000';
  END IF;
  SELECT * INTO v_res FROM public.reservation_requests rr
    WHERE rr.id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002'; END IF;
  IF v_res.request_status NOT IN ('pending', 'incomplete')
     OR v_res.details_validated IS DISTINCT FROM true
     OR v_res.reservation_date IS NULL OR v_res.reservation_time IS NULL THEN
    RAISE EXCEPTION 'Only a validated unconfirmed reservation may be amended here'
      USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_inter FROM public.reservation_staff_interventions si
    WHERE si.id = p_intervention_id
      AND si.reservation_request_id = p_reservation_id
      AND si.conversation_id = p_conversation_id
      AND si.intervention_type = 'revised_availability'
    FOR UPDATE;
  IF NOT FOUND OR v_inter.status <> 'staff_review' OR
     v_inter.mode_version_at_start <> p_expected_mode_version OR
     v_inter.details ->> 'outbound_message_sid' IS NULL THEN
    RAISE EXCEPTION 'Verified guest selection and sent intervention required'
      USING ERRCODE = '55000';
  END IF;
  IF v_inter.details #>> '{send_claim,reservation_date}'
     IS DISTINCT FROM v_res.reservation_date::text THEN
    RAISE EXCEPTION 'Reservation date differs from the sent offer' USING ERRCODE = '22023';
  END IF;
  v_choice := v_inter.details #>> '{guest_choice,selected_time}';
  IF v_choice IS NULL OR v_choice !~ '^(1[0-9]|2[0-1]):(00|30)$|^22:00$'
     OR v_inter.details #>> '{guest_choice,inbound_message_sid}' IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM jsonb_array_elements_text(v_inter.details -> 'revised_times') opt(t)
       WHERE opt.t = v_choice
     ) THEN
    RAISE EXCEPTION 'Verified selected time does not match the sent options'
      USING ERRCODE = '22023';
  END IF;
  IF v_res.reservation_time = v_choice::time THEN
    RAISE EXCEPTION 'Selected time is already on the reservation. Review booking status.'
      USING ERRCODE = '22023';
  END IF;

  -- Same database transaction and locks. The existing function still enforces
  -- its feature-independent database rules, status, 90-day window, workflow
  -- state, legacy alternative-offer freeze, audit log, and 30-minute slots.
  -- Never assert a Yelp update on an unconfirmed booking.
  SELECT * INTO v_result
  FROM public.amend_reservation_datetime(
    p_reservation_id, v_res.reservation_date, v_res.reservation_time,
    v_res.reservation_date, v_choice::time, false
  );
  IF NOT FOUND OR v_result.reservation_id IS DISTINCT FROM p_reservation_id
     OR v_result.reservation_date IS DISTINCT FROM v_res.reservation_date
     OR v_result.reservation_time IS DISTINCT FROM v_choice::time THEN
    RAISE EXCEPTION 'Underlying amendment result could not be verified' USING ERRCODE = '55000';
  END IF;
  RETURN QUERY SELECT v_result.reservation_id::uuid,
    v_result.reservation_date::date,
    v_result.reservation_time::time without time zone,
    v_result.workflow_status::text;
END;
$function$;
REVOKE ALL ON FUNCTION public.apply_verified_staff_intervention_selected_time(uuid,uuid,bigint,uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_verified_staff_intervention_selected_time(uuid,uuid,bigint,uuid)
  TO authenticated;
COMMIT;