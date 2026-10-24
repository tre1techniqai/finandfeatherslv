-- Fin & Feathers LV — Staff ownership transition (NOT activation).
-- Install only after reviewing; do not invoke until Studio inbound staff
-- routing is published and independently verified, and all active Studio
-- executions for the phone pair have been safely handled.
-- This function CANNOT itself verify Twilio routing or Studio state.
BEGIN;

CREATE OR REPLACE FUNCTION public.complete_reservation_conversation_handoff(
  p_reservation_id uuid,
  p_restaurant_phone text,
  p_manager_id uuid
)
RETURNS TABLE (ownership_status text, ownership_id uuid, claimed_by uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_guest_phone text;
  v_row public.reservation_conversation_ownership%ROWTYPE;
BEGIN
  -- Only a trusted server with service_role permissions may call this.
  -- A manager's JWT must NEVER be given permission to invoke it directly.
  IF p_manager_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    WHERE sr.user_id = p_manager_id
      AND sr.is_active = true
      AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Active manager required' USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR p_restaurant_phone IS NULL OR
     p_restaurant_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Invalid handoff details' USING ERRCODE = '22023';
  END IF;

  SELECT rr.customer_phone INTO v_guest_phone
  FROM public.reservation_requests rr
  WHERE rr.id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_guest_phone IS NULL OR
     v_guest_phone !~ '^\+[1-9][0-9]{7,14}$' OR
     v_guest_phone = p_restaurant_phone THEN
    RAISE EXCEPTION 'Reservation phone invalid' USING ERRCODE = '22023';
  END IF;

  -- Lock the unique phone-pair row. The claim must still refer to the
  -- exact reservation and manager who requested it.
  SELECT * INTO v_row
  FROM public.reservation_conversation_ownership co
  WHERE co.restaurant_phone = p_restaurant_phone
    AND co.guest_phone = v_guest_phone
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Handoff not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.ownership_status <> 'handoff_pending' OR
     v_row.claimed_by IS DISTINCT FROM p_manager_id OR
     v_row.reservation_request_id IS DISTINCT FROM p_reservation_id THEN
    RAISE EXCEPTION 'Pending handoff is no longer owned by this manager'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.reservation_conversation_ownership co
  SET ownership_status = 'staff',
      claimed_by = p_manager_id,
      claimed_at = now(),
      released_at = NULL,
      updated_at = now()
  WHERE co.id = v_row.id
  RETURNING * INTO v_row;

  RETURN QUERY
  SELECT v_row.ownership_status, v_row.id, v_row.claimed_by;
END;
$function$;

-- SECURITY DEFINER routines otherwise commonly inherit PUBLIC EXECUTE.
REVOKE ALL ON FUNCTION public.complete_reservation_conversation_handoff(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_reservation_conversation_handoff(uuid, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.complete_reservation_conversation_handoff(uuid, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_reservation_conversation_handoff(uuid, text, uuid) TO service_role;

COMMENT ON FUNCTION public.complete_reservation_conversation_handoff(uuid, text, uuid) IS
  'Privileged DB-only pending-to-staff transition. Twilio execution and inbound routing must be verified by a trusted server BEFORE invocation; this function cannot verify external Twilio state.';

COMMIT;
