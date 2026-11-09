-- Stage 1.79B: persist draft revised times ONLY.
-- No messages sent, no booking modifications, no new table/column.
BEGIN;

CREATE FUNCTION public.save_reservation_staff_intervention_times(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_intervention_id uuid,
  p_times text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_role text;
  v_reservation public.reservation_requests%ROWTYPE;
  v_conversation public.reservation_shared_conversations%ROWTYPE;
  v_intervention public.reservation_staff_interventions%ROWTYPE;
  v_time text;
  v_count int;
  v_canonical text[] := ARRAY[]::text[];
  v_payload jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_role FROM public.staff_roles
  WHERE user_id = v_actor AND is_active = true
    AND role IN ('manager','reservation_agent')
  FOR SHARE;
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Reservation staff authorization required'
      USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR p_conversation_id IS NULL
    OR p_expected_mode_version IS NULL OR p_expected_mode_version < 1
    OR p_intervention_id IS NULL OR p_times IS NULL THEN
    RAISE EXCEPTION 'Invalid revised availability request'
      USING ERRCODE = '22023';
  END IF;

  v_count := cardinality(p_times);
  IF v_count > 3 THEN
    RAISE EXCEPTION 'At most three revised times permitted'
      USING ERRCODE = '22023';
  END IF;

  -- Lock order matches intervention start and cancellation.
  SELECT * INTO v_reservation FROM public.reservation_requests
  WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_reservation.request_status NOT IN ('pending','incomplete')
     OR v_reservation.details_validated IS DISTINCT FROM true
     OR v_reservation.reservation_date IS NULL
     OR v_reservation.reservation_time IS NULL THEN
    RAISE EXCEPTION 'Reservation is not eligible for revised availability'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_conversation FROM public.reservation_shared_conversations
  WHERE id = p_conversation_id
    AND reservation_request_id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation conversation mismatch'
      USING ERRCODE = '22023';
  END IF;
  IF v_conversation.mode <> 'staff'
    OR v_conversation.mode_version <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Staff conversation ownership required'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_intervention FROM public.reservation_staff_interventions
  WHERE id = p_intervention_id
    AND reservation_request_id = p_reservation_id
    AND conversation_id = p_conversation_id
    AND intervention_type = 'revised_availability'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intervention not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_intervention.status <> 'draft'
    OR v_intervention.mode_version_at_start <> p_expected_mode_version
    OR v_intervention.resolution IS NOT NULL
    OR (v_intervention.details <> '{}'::jsonb AND
        (NOT v_intervention.details ? 'revised_times' OR
         (SELECT count(*) FROM jsonb_object_keys(v_intervention.details) AS k(key)
          WHERE k.key NOT IN ('revised_times','draft_saved_by','draft_saved_at')) > 0)) THEN
    RAISE EXCEPTION 'Only an active draft may be edited'
      USING ERRCODE = '22023';
  END IF;

  -- The array order is the proposed choice order, not sorted clock order.
  FOREACH v_time IN ARRAY p_times LOOP
    IF v_time IS NULL OR v_time !~ '^(1[0-9]|2[0-1]):(00|30)$|^22:00$'
       OR v_time = ANY(v_canonical) THEN
      RAISE EXCEPTION 'Invalid or repeated revised time'
        USING ERRCODE = '22023';
    END IF;
    IF (v_reservation.reservation_date + v_time::time)
        AT TIME ZONE 'America/Los_Angeles' < clock_timestamp() + interval '2 hours' THEN
      RAISE EXCEPTION 'Revised time must be at least two hours ahead'
        USING ERRCODE = '22023';
    END IF;
    v_canonical := array_append(v_canonical, v_time);
  END LOOP;

  IF v_count = 0 THEN
    -- Clearing returns the draft to pristine state, so the already-deployed
    -- cancel-unsent-draft procedure remains usable without modification.
    v_payload := '{}'::jsonb;
  ELSE
    v_payload := jsonb_build_object(
      'revised_times', to_jsonb(v_canonical),
      'draft_saved_by', v_actor,
      'draft_saved_at', clock_timestamp()
    );
  END IF;

  IF v_count = 0 AND v_intervention.details = '{}'::jsonb THEN
    RETURN v_intervention.id;
  END IF;
  IF v_count > 0 AND v_intervention.details -> 'revised_times' = to_jsonb(v_canonical) THEN
    RETURN v_intervention.id;
  END IF;

  UPDATE public.reservation_staff_interventions
  SET details = v_payload, updated_at = clock_timestamp()
  WHERE id = p_intervention_id AND status = 'draft';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft state changed' USING ERRCODE = '22023';
  END IF;
  RETURN p_intervention_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.save_reservation_staff_intervention_times(
  uuid, uuid, bigint, uuid, text[]
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_reservation_staff_intervention_times(
  uuid, uuid, bigint, uuid, text[]
) TO authenticated;
COMMIT;