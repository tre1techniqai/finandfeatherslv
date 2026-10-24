
-- Fin & Feathers Las Vegas
-- Staff Conversation Release
--
-- Allows the manager who owns an active staff conversation
-- to release it back to reservation automation.
--
-- No table, column, constraint, or RLS policy changes.

CREATE OR REPLACE FUNCTION public.release_reservation_conversation_handoff(
  p_reservation_id uuid,
  p_restaurant_phone text
)
RETURNS TABLE (
  ownership_status text,
  ownership_id uuid,
  released_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_guest_phone text;
  v_row public.reservation_conversation_ownership%ROWTYPE;
BEGIN

  -- 1. Require an authenticated active manager.
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.staff_roles sr
    WHERE sr.user_id = v_user
      AND sr.is_active = true
      AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Manager access required'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Validate reservation and restaurant identifiers.
  IF p_reservation_id IS NULL
     OR p_restaurant_phone IS NULL
     OR p_restaurant_phone !~ '^\+[1-9][0-9]{7,14}$'
  THEN
    RAISE EXCEPTION 'Invalid conversation details'
      USING ERRCODE = '22023';
  END IF;

  -- 3. Resolve the guest from the existing reservation.
  SELECT rr.customer_phone
  INTO v_guest_phone
  FROM public.reservation_requests rr
  WHERE rr.id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_guest_phone IS NULL
     OR v_guest_phone !~ '^\+[1-9][0-9]{7,14}$'
     OR v_guest_phone = p_restaurant_phone
  THEN
    RAISE EXCEPTION 'Reservation guest phone is invalid'
      USING ERRCODE = '22023';
  END IF;

  -- 4. Lock the unique guest/restaurant conversation row.
  SELECT *
  INTO v_row
  FROM public.reservation_conversation_ownership co
  WHERE co.restaurant_phone = p_restaurant_phone
    AND co.guest_phone = v_guest_phone
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation ownership not found'
      USING ERRCODE = 'P0002';
  END IF;

  -- 5. Release is permitted only for the manager
  -- who currently owns this exact reservation conversation.
  IF v_row.ownership_status <> 'staff'
     OR v_row.claimed_by IS DISTINCT FROM v_user
     OR v_row.reservation_request_id IS DISTINCT FROM p_reservation_id
  THEN
    RAISE EXCEPTION
      'Conversation is not staff-owned by this manager and reservation'
      USING ERRCODE = '22023';
  END IF;

  -- 6. Return ownership to automation.
  --
  -- The existing Studio router treats 'released'
  -- as an automation-owned conversation.
  UPDATE public.reservation_conversation_ownership co
  SET
    ownership_status = 'released',
    claimed_by = NULL,
    claimed_at = NULL,
    released_at = now(),
    updated_at = now()
  WHERE co.id = v_row.id
    AND co.ownership_status = 'staff'
    AND co.claimed_by = v_user
    AND co.reservation_request_id = p_reservation_id
  RETURNING *
  INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation release could not be completed'
      USING ERRCODE = '22023';
  END IF;

  -- 7. Confirm the resulting state.
  RETURN QUERY
  SELECT
    v_row.ownership_status,
    v_row.id,
    v_row.released_at;

END;
$function$;

-- Prevent access through the default PUBLIC function grant.
REVOKE ALL ON FUNCTION public.release_reservation_conversation_handoff(
  uuid, text
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.release_reservation_conversation_handoff(
  uuid, text
) FROM anon;

-- Authenticated callers may invoke the function, but
-- the function independently enforces active manager
-- authorization and conversation ownership.
GRANT EXECUTE ON FUNCTION public.release_reservation_conversation_handoff(
  uuid, text
) TO authenticated;
