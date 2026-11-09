-- Stage 1.79D3: REPLACEMENT for the unpublished Stage D1 resolution migration.
-- Verify the EFFECTIVE confirmed booking time. Legacy alternative acceptance
-- stores accepted_time in reservation_staff_workflows while preserving the
-- original requested reservation_requests.reservation_time.
-- REVIEW ONLY. Do not apply alongside the older 006 candidate.
BEGIN;
CREATE FUNCTION public.resolve_reservation_staff_intervention_after_booking(
  p_reservation_id uuid, p_conversation_id uuid,
  p_expected_mode_version bigint, p_intervention_id uuid,
  p_staff_verified_guest_acceptance boolean
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_res public.reservation_requests%ROWTYPE;
  v_conv public.reservation_shared_conversations%ROWTYPE;
  v_inter public.reservation_staff_interventions%ROWTYPE;
  v_work public.reservation_staff_workflows%ROWTYPE;
  v_times jsonb;
  v_booked text;
  v_booked_source text;
  v_at timestamptz := clock_timestamp();
BEGIN
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = v_actor AND is_active = true
      AND role IN ('manager','reservation_agent')
  ) THEN RAISE EXCEPTION 'Reservation staff authorization required' USING ERRCODE = '42501'; END IF;
  IF p_reservation_id IS NULL OR p_conversation_id IS NULL OR
     p_expected_mode_version IS NULL OR p_expected_mode_version < 1 OR
     p_intervention_id IS NULL OR p_staff_verified_guest_acceptance IS DISTINCT FROM true
  THEN RAISE EXCEPTION 'Verified guest acceptance is required' USING ERRCODE = '22023'; END IF;

  SELECT * INTO v_conv FROM public.reservation_shared_conversations
  WHERE id = p_conversation_id AND reservation_request_id = p_reservation_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conversation association mismatch' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_res FROM public.reservation_requests
  WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_inter FROM public.reservation_staff_interventions
  WHERE id = p_intervention_id AND reservation_request_id = p_reservation_id
    AND conversation_id = p_conversation_id
    AND intervention_type = 'revised_availability' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Intervention not found' USING ERRCODE = 'P0002'; END IF;

  IF v_inter.status = 'resolved' AND v_inter.resolution ->> 'action' = 'confirmed_booking_verified' THEN
    RETURN 'resolved';
  END IF;
  IF v_conv.mode <> 'staff' OR v_conv.mode_version <> p_expected_mode_version OR
     v_inter.mode_version_at_start <> p_expected_mode_version OR
     v_inter.status <> 'staff_review' THEN
    RAISE EXCEPTION 'Active staff-owned intervention required' USING ERRCODE = '55000';
  END IF;
  IF v_inter.details ->> 'outbound_message_sid' IS NULL OR
     v_inter.details -> 'send_claim' IS NULL OR
     jsonb_typeof(v_inter.details -> 'revised_times') <> 'array' THEN
    RAISE EXCEPTION 'Verified sent time options required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_work FROM public.reservation_staff_workflows
  WHERE reservation_request_id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR v_res.request_status <> 'confirmed' OR
     v_work.workflow_status <> 'confirmed' OR
     v_res.reservation_time IS NULL OR v_res.reservation_date IS NULL THEN
    RAISE EXCEPTION 'Booking must be fully confirmed first' USING ERRCODE = '55000';
  END IF;
  IF v_inter.details #>> '{send_claim,reservation_date}'
       IS DISTINCT FROM v_res.reservation_date::text THEN
    RAISE EXCEPTION 'Confirmed reservation date differs from the sent revised-time offer'
      USING ERRCODE = '22023';
  END IF;

  -- The trusted workflow's accepted time is the effective booking time when
  -- an alternative was accepted. The base request time is only a fallback.
  IF v_work.accepted_time IS NOT NULL THEN
    v_booked := to_char(v_work.accepted_time, 'HH24:MI');
    v_booked_source := 'workflow_accepted_time';
  ELSE
    v_booked := to_char(v_res.reservation_time, 'HH24:MI');
    v_booked_source := 'reservation_time';
  END IF;

  -- A staff attestation alone is NOT evidence of guest acceptance.
  IF v_inter.details #>> '{guest_choice,selected_time}' IS NULL OR
     v_inter.details #>> '{guest_choice,inbound_message_sid}' IS NULL OR
     v_inter.details #>> '{guest_choice,selected_time}' IS DISTINCT FROM v_booked THEN
    RAISE EXCEPTION 'Verified guest-selected time must match effective confirmed booking'
      USING ERRCODE = '22023';
  END IF;
  v_times := v_inter.details -> 'revised_times';
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(v_times) AS offered(value)
    WHERE offered.value = v_booked
  ) THEN RAISE EXCEPTION 'Effective confirmed time does not match sent revised options' USING ERRCODE = '22023'; END IF;

  UPDATE public.reservation_staff_interventions
  SET status = 'resolved', resolved_at = v_at, updated_at = v_at,
      resolution = jsonb_build_object(
        'action','confirmed_booking_verified',
        'confirmed_time',v_booked,
        'booked_time_source',v_booked_source,
        'guest_inbound_message_sid',v_inter.details #>> '{guest_choice,inbound_message_sid}',
        'staff_attested_guest_acceptance',true,
        'verified_by',v_actor,'verified_at',v_at
      )
  WHERE id = p_intervention_id AND status = 'staff_review';
  IF NOT FOUND THEN RAISE EXCEPTION 'Intervention state changed' USING ERRCODE = '55000'; END IF;
  RETURN 'resolved';
END;
$function$;
REVOKE ALL ON FUNCTION public.resolve_reservation_staff_intervention_after_booking(uuid,uuid,bigint,uuid,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_reservation_staff_intervention_after_booking(uuid,uuid,bigint,uuid,boolean)
  TO authenticated;
COMMIT;