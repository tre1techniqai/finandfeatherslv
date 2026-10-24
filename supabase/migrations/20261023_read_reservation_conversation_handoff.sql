-- Fin & Feathers LV — Stage 3A: manager-only read of stored handoff state.
-- No table modifications, writes, SMS, Studio execution changes, or routing changes.
-- Run after the ownership table and pending-handoff migrations.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_reservation_conversation_handoff(
  p_reservation_id uuid,
  p_restaurant_phone text
)
RETURNS TABLE (
  ownership_id uuid,
  ownership_status text,
  linked_reservation_id uuid,
  claimed_by uuid,
  claimed_at timestamptz,
  released_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_guest_phone text;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    WHERE sr.user_id = v_user
      AND sr.is_active = true
      AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Manager access required' USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR p_restaurant_phone IS NULL OR
     p_restaurant_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Invalid conversation details' USING ERRCODE = '22023';
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
    RAISE EXCEPTION 'Reservation guest phone is invalid' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    co.id,
    co.ownership_status,
    co.reservation_request_id,
    co.claimed_by,
    co.claimed_at,
    co.released_at,
    co.updated_at
  FROM public.reservation_conversation_ownership co
  WHERE co.restaurant_phone = p_restaurant_phone
    AND co.guest_phone = v_guest_phone;
  -- Zero rows means no ownership record exists yet; callers should
  -- distinguish that from an actual stored 'automation' status.
END;
$$;

REVOKE ALL ON FUNCTION public.get_reservation_conversation_handoff(uuid,text)
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_reservation_conversation_handoff(uuid,text)
FROM anon;
GRANT EXECUTE ON FUNCTION public.get_reservation_conversation_handoff(uuid,text)
TO authenticated;

COMMENT ON FUNCTION public.get_reservation_conversation_handoff(uuid,text)
IS 'Manager-only, read-only view of the phone-pair conversation handoff; no SMS or Studio changes.';

COMMIT;
