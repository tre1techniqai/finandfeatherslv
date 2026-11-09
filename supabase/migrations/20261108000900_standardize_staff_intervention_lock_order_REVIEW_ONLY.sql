
-- Stage 1.79E7: REVIEW ONLY.
-- Correct conversation/reservation lock order in three existing deployed
-- staff-intervention functions. No schema changes, SMS, or reservation edits.
-- Review and approve before executing in Supabase SQL Editor.
BEGIN;

CREATE OR REPLACE FUNCTION public.cancel_reservation_staff_intervention_draft(
  p_reservation_id uuid, p_conversation_id uuid,
  p_expected_mode_version bigint, p_intervention_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_role text;
  v_conversation public.reservation_shared_conversations%ROWTYPE;
  v_intervention public.reservation_staff_interventions%ROWTYPE;
  v_at timestamptz := clock_timestamp();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_role
  FROM public.staff_roles
  WHERE user_id = v_actor AND is_active = true
    AND role IN ('manager', 'reservation_agent')
  FOR SHARE;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Reservation staff authorization required'
      USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR p_conversation_id IS NULL
     OR p_intervention_id IS NULL OR p_expected_mode_version IS NULL
     OR p_expected_mode_version < 1 THEN
    RAISE EXCEPTION 'Invalid intervention cancellation request'
      USING ERRCODE = '22023';
  END IF;

  -- Standard shared conversation-first lock order.
  SELECT * INTO v_conversation
  FROM public.reservation_shared_conversations
  WHERE id = p_conversation_id
    AND reservation_request_id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation conversation mismatch'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1 FROM public.reservation_requests
  WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_intervention
  FROM public.reservation_staff_interventions
  WHERE id = p_intervention_id
    AND reservation_request_id = p_reservation_id
    AND conversation_id = p_conversation_id
    AND intervention_type = 'revised_availability'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intervention not found' USING ERRCODE = 'P0002';
  END IF;

  -- Replayed successful cancellation is harmless, even if staff has since
  -- handed the conversation back to automation.
  IF v_intervention.status = 'canceled'
     AND v_intervention.resolution ->> 'action' = 'cancel_unsent_draft' THEN
    RETURN v_intervention.id;
  END IF;

  IF v_conversation.mode <> 'staff'
     OR v_conversation.mode_version <> p_expected_mode_version
     OR v_intervention.mode_version_at_start <> p_expected_mode_version THEN
    RAISE EXCEPTION 'Verified staff conversation ownership is required'
      USING ERRCODE = '22023';
  END IF;

  IF v_intervention.status <> 'draft'
     OR v_intervention.details <> '{}'::jsonb
     OR v_intervention.resolution IS NOT NULL THEN
    RAISE EXCEPTION 'Only a pristine, unsent draft can be canceled'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.reservation_staff_interventions
  SET status = 'canceled',
      resolved_at = v_at,
      updated_at = v_at,
      resolution = jsonb_build_object(
        'action', 'cancel_unsent_draft',
        'canceled_by', v_actor,
        'canceled_at', v_at
      )
  WHERE id = p_intervention_id AND status = 'draft';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft state changed' USING ERRCODE = '22023';
  END IF;

  -- Do NOT change the conversation mode; staff decides when to hand back.
  -- The existing ownership guard will permit that only when no intervention
  -- remains active.
  RETURN p_intervention_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_reservation_staff_intervention_times(
  p_reservation_id uuid, p_conversation_id uuid,
  p_expected_mode_version bigint, p_intervention_id uuid, p_times text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

  -- Standard shared conversation-first lock order.
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

CREATE OR REPLACE FUNCTION public.start_reservation_staff_intervention(
  p_reservation_id uuid, p_conversation_id uuid,
  p_expected_mode_version bigint, p_request_key uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_role text;
  v_reservation public.reservation_requests%ROWTYPE;
  v_conversation public.reservation_shared_conversations%ROWTYPE;
  v_existing public.reservation_staff_interventions%ROWTYPE;
  v_intervention_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  SELECT sr.role
    INTO v_role
  FROM public.staff_roles sr
  WHERE sr.user_id = v_user_id
    AND sr.is_active = true
    AND sr.role IN ('manager', 'reservation_agent')
  FOR SHARE;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Reservation staff authorization required'
      USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL
     OR p_conversation_id IS NULL
     OR p_request_key IS NULL
     OR p_expected_mode_version IS NULL
     OR p_expected_mode_version < 1 THEN
    RAISE EXCEPTION 'Invalid intervention request'
      USING ERRCODE = '22023';
  END IF;

  -- Serialize intervention creation against changes
  -- to the underlying reservation.
  -- Require an unambiguous, reservation-associated
  -- conversation that has already entered staff mode.

  SELECT *
    INTO v_conversation
  FROM public.reservation_shared_conversations sc
  WHERE sc.id = p_conversation_id
    AND sc.reservation_request_id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation conversation not found'
      USING ERRCODE = '22023';
  END IF;

  IF v_conversation.mode <> 'staff'
     OR v_conversation.mode_version
        <> p_expected_mode_version THEN
    RAISE EXCEPTION
      'Verified staff conversation ownership is required'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO v_reservation
  FROM public.reservation_requests rr
  WHERE rr.id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_reservation.request_status NOT IN (
       'pending',
       'incomplete'
     )
     OR v_reservation.details_validated IS DISTINCT FROM true
     OR v_reservation.reservation_date IS NULL
     OR v_reservation.reservation_time IS NULL THEN
    RAISE EXCEPTION
      'Reservation is not eligible for revised availability'
      USING ERRCODE = '22023';
  END IF;

  -- Prevent an already-used request key from being
  -- reassigned to another reservation or staff member.

  SELECT *
    INTO v_existing
  FROM public.reservation_staff_interventions si
  WHERE si.request_key = p_request_key;

  IF FOUND THEN
    IF v_existing.reservation_request_id
         IS DISTINCT FROM p_reservation_id
       OR v_existing.conversation_id
         IS DISTINCT FROM p_conversation_id
       OR v_existing.initiated_by
         IS DISTINCT FROM v_user_id
       OR v_existing.mode_version_at_start
         IS DISTINCT FROM p_expected_mode_version THEN
      RAISE EXCEPTION 'Intervention request key conflict'
        USING ERRCODE = '22023';
    END IF;

    RETURN v_existing.id;
  END IF;

  INSERT INTO public.reservation_staff_interventions (
    reservation_request_id,
    conversation_id,
    request_key,
    intervention_type,
    status,
    initiated_by,
    assigned_to,
    mode_version_at_start
  )
  VALUES (
    p_reservation_id,
    p_conversation_id,
    p_request_key,
    'revised_availability',
    'draft',
    v_user_id,
    v_user_id,
    p_expected_mode_version
  )
  RETURNING id INTO v_intervention_id;

  RETURN v_intervention_id;
END;
$function$;

COMMIT;