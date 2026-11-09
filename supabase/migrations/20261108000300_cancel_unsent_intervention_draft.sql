-- Staff Intervention — cancel an UNSENT draft only.
-- No new tables, columns, triggers, Twilio actions, or mode changes.
-- Must be applied before enabling the corresponding API/UI.

BEGIN;

CREATE OR REPLACE FUNCTION public.cancel_reservation_staff_intervention_draft(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_intervention_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

  -- Match the row locking order used by intervention creation:
  -- reservation, conversation, intervention.
  PERFORM 1 FROM public.reservation_requests
  WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_conversation
  FROM public.reservation_shared_conversations
  WHERE id = p_conversation_id
    AND reservation_request_id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation conversation mismatch'
      USING ERRCODE = '22023';
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

REVOKE ALL ON FUNCTION public.cancel_reservation_staff_intervention_draft(
  uuid, uuid, bigint, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_reservation_staff_intervention_draft(
  uuid, uuid, bigint, uuid
) TO authenticated;

COMMIT;