-- Stage 1.79D2: record a verified guest option selection in a staff intervention.
-- REVIEW ONLY until compiled, reconciled with live schema, and approved.
-- Does not send SMS, amend bookings, or affect legacy alternatives.
BEGIN;

CREATE FUNCTION public.record_verified_staff_intervention_guest_selection(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_intervention_id uuid,
  p_inbound_message_sid text,
  p_option_number integer,
  p_staff_user_id uuid
)
RETURNS TABLE(outcome text, selected_time text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_res public.reservation_requests%ROWTYPE;
  v_conversation public.reservation_shared_conversations%ROWTYPE;
  v_intervention public.reservation_staff_interventions%ROWTYPE;
  v_inbound_created_at timestamptz;
  v_outbound public.reservation_shared_sms_operations%ROWTYPE;
  v_options jsonb;
  v_selected text;
  v_existing jsonb;
  v_at timestamptz := clock_timestamp();
BEGIN
  -- Only a server-side service-role operation may assert that the SMS body
  -- was independently checked with Twilio. Never trust browser claims.
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service role required' USING ERRCODE = '42501';
  END IF;
  IF p_reservation_id IS NULL OR p_conversation_id IS NULL
    OR p_intervention_id IS NULL OR p_staff_user_id IS NULL
    OR p_expected_mode_version IS NULL OR p_expected_mode_version < 1
    OR p_inbound_message_sid IS NULL
    OR p_inbound_message_sid !~ '^SM[0-9a-fA-F]{32}$'
    OR p_option_number IS NULL OR p_option_number NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'Invalid guest selection' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = p_staff_user_id AND is_active = true
      AND role IN ('manager','reservation_agent')
  ) THEN
    RAISE EXCEPTION 'Active reservation staff required' USING ERRCODE = '42501';
  END IF;

  -- Preserve shared conversation-first lock order.
  SELECT * INTO v_conversation FROM public.reservation_shared_conversations
    WHERE id = p_conversation_id AND reservation_request_id = p_reservation_id
    FOR UPDATE;
  IF NOT FOUND OR v_conversation.mode <> 'staff'
    OR v_conversation.mode_version <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Verified staff conversation required' USING ERRCODE = '55000';
  END IF;
  SELECT * INTO v_res FROM public.reservation_requests
    WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR v_res.request_status NOT IN ('pending','incomplete')
    OR v_res.details_validated IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Reservation is not eligible' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_intervention FROM public.reservation_staff_interventions
    WHERE id = p_intervention_id
      AND reservation_request_id = p_reservation_id
      AND conversation_id = p_conversation_id
      AND intervention_type = 'revised_availability'
    FOR UPDATE;
  IF NOT FOUND OR v_intervention.mode_version_at_start <> p_expected_mode_version
    OR v_intervention.status NOT IN ('awaiting_guest','staff_review')
    OR v_intervention.details ->> 'outbound_message_sid' IS NULL THEN
    RAISE EXCEPTION 'An active, sent intervention is required' USING ERRCODE = '55000';
  END IF;

  IF v_intervention.details #>> '{send_claim,reservation_date}'
       IS DISTINCT FROM v_res.reservation_date::text THEN
    RAISE EXCEPTION 'Reservation date changed after revised offer was sent'
      USING ERRCODE = '55000';
  END IF;
  v_options := v_intervention.details -> 'revised_times';
  IF v_options IS NULL OR jsonb_typeof(v_options) <> 'array'
    OR jsonb_array_length(v_options) NOT BETWEEN p_option_number AND 3 THEN
    RAISE EXCEPTION 'Selected option is not in the sent offer' USING ERRCODE = '22023';
  END IF;
  v_selected := v_options ->> (p_option_number - 1);
  IF v_selected IS NULL OR
    v_selected !~ '^(1[0-9]|2[0-1]):(00|30)$|^22:00$' THEN
    RAISE EXCEPTION 'Invalid selected time' USING ERRCODE = '22023';
  END IF;

  -- An inbound SMS must already be linked by the protected reservation-aware
  -- ingestion path to this EXACT conversation. A phone match is insufficient.
  SELECT ie.message_created_at INTO v_inbound_created_at
  FROM public.reservation_shared_inbound_events ie
  WHERE ie.conversation_id = p_conversation_id
    AND lower(ie.twilio_message_sid) = lower(p_inbound_message_sid);
  IF NOT FOUND OR v_inbound_created_at IS NULL THEN
    RAISE EXCEPTION 'Verified reservation-scoped inbound SMS required'
      USING ERRCODE = '22023';
  END IF;
  -- A claim only reserves a send; it is NOT proof that Twilio accepted it.
  -- Reconcile the intervention to the exact accepted outbound operation.
  -- The operation ledger's completed_at is the server-recorded acceptance
  -- boundary. Its status constraint requires this timestamp for 'accepted'.
  SELECT * INTO v_outbound
  FROM public.reservation_shared_sms_operations op
  WHERE op.id::text = v_intervention.details ->> 'outbound_operation_id'
    AND op.conversation_id = p_conversation_id
    AND op.reservation_request_id = p_reservation_id
    AND op.client_request_id::text =
      v_intervention.details #>> '{send_claim,client_request_id}'
    AND op.twilio_message_sid = v_intervention.details ->> 'outbound_message_sid'
    AND op.message_body = v_intervention.details #>> '{send_claim,message_body}'
    AND op.manager_id::text = v_intervention.details #>> '{send_claim,claimed_by}'
    AND op.status = 'accepted';
  IF NOT FOUND OR v_outbound.completed_at IS NULL THEN
    RAISE EXCEPTION 'Accepted revised-time SMS operation cannot be verified'
      USING ERRCODE = '55000';
  END IF;
  IF v_inbound_created_at <= v_outbound.completed_at THEN
    RAISE EXCEPTION 'Reply does not follow accepted revised-time SMS'
      USING ERRCODE = '22023';
  END IF;

  -- A Message SID cannot evidence multiple interventions.
  IF EXISTS (
    SELECT 1 FROM public.reservation_staff_interventions other
    WHERE other.id <> p_intervention_id
      AND lower(other.details #>> '{guest_choice,inbound_message_sid}')
          = lower(p_inbound_message_sid)
  ) THEN
    RAISE EXCEPTION 'Inbound SMS is already assigned elsewhere' USING ERRCODE = '22023';
  END IF;

  v_existing := v_intervention.details -> 'guest_choice';
  IF v_existing IS NOT NULL THEN
    IF lower(v_existing ->> 'inbound_message_sid') = lower(p_inbound_message_sid)
      AND v_existing ->> 'selected_time' = v_selected
      AND (v_existing ->> 'option_number')::integer = p_option_number THEN
      RETURN QUERY SELECT 'duplicate'::text, v_selected;
      RETURN;
    END IF;
    RAISE EXCEPTION 'Selection already recorded; manual reconciliation required'
      USING ERRCODE = '55000';
  END IF;
  IF v_intervention.status <> 'awaiting_guest' THEN
    RAISE EXCEPTION 'Intervention already requires staff review' USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_staff_interventions
  SET status = 'staff_review', updated_at = v_at,
    details = details || jsonb_build_object('guest_choice', jsonb_build_object(
      'inbound_message_sid', p_inbound_message_sid,
      'outbound_message_sid', v_outbound.twilio_message_sid,
      'outbound_operation_id', v_outbound.id,
      'outbound_accepted_at', v_outbound.completed_at,
      'inbound_message_created_at', v_inbound_created_at,
      'option_number', p_option_number,
      'selected_time', v_selected,
      'verified_by', p_staff_user_id,
      'verified_at', v_at
    ))
  WHERE id = p_intervention_id AND status = 'awaiting_guest';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intervention state changed' USING ERRCODE = '55000';
  END IF;
  RETURN QUERY SELECT 'recorded'::text, v_selected;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_verified_staff_intervention_guest_selection(
 uuid,uuid,bigint,uuid,text,integer,uuid
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_staff_intervention_guest_selection(
 uuid,uuid,bigint,uuid,text,integer,uuid
) TO service_role;
COMMIT;