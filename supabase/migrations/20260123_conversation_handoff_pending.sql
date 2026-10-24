-- Fin & Feathers LV: Stage 2, pending handoff requests ONLY.
-- Safe to review and apply after the existing ownership table migration.
-- Does not activate staff ownership, send SMS, end Studio, or change routing.
BEGIN;

CREATE OR REPLACE FUNCTION public.request_reservation_conversation_handoff(
  p_reservation_id uuid,
  p_restaurant_phone text
)
RETURNS TABLE (ownership_status text, ownership_id uuid, claimed_by uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_guest_phone text;
  v_row public.reservation_conversation_ownership%ROWTYPE;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    WHERE sr.user_id = v_user AND sr.is_active = true AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Manager access required' USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR p_restaurant_phone IS NULL OR
     p_restaurant_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Invalid handoff details' USING ERRCODE = '22023';
  END IF;

  SELECT rr.customer_phone INTO v_guest_phone
  FROM public.reservation_requests rr WHERE rr.id = p_reservation_id;

  IF NOT FOUND OR v_guest_phone IS NULL OR
     v_guest_phone !~ '^\+[1-9][0-9]{7,14}$' OR
     v_guest_phone = p_restaurant_phone THEN
    RAISE EXCEPTION 'Reservation or guest phone unavailable' USING ERRCODE = '22023';
  END IF;

  -- Unique phone pair arbitrates concurrent first claims.
  INSERT INTO public.reservation_conversation_ownership (
    guest_phone, restaurant_phone, reservation_request_id,
    ownership_status, claimed_by, claimed_at, released_at
  ) VALUES (
    v_guest_phone, p_restaurant_phone, p_reservation_id,
    'handoff_pending', v_user, now(), NULL
  ) ON CONFLICT (restaurant_phone, guest_phone) DO NOTHING;

  SELECT * INTO v_row
  FROM public.reservation_conversation_ownership co
  WHERE co.restaurant_phone = p_restaurant_phone
    AND co.guest_phone = v_guest_phone
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ownership record unavailable' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.ownership_status = 'staff' THEN
    RAISE EXCEPTION 'Conversation already staff-managed' USING ERRCODE = '22023';
  END IF;

  IF v_row.ownership_status = 'handoff_pending'
     AND v_row.claimed_by IS DISTINCT FROM v_user THEN
    RAISE EXCEPTION 'Another manager has requested this conversation' USING ERRCODE = '22023';
  END IF;

  IF v_row.ownership_status <> 'handoff_pending' THEN
    UPDATE public.reservation_conversation_ownership co
    SET ownership_status = 'handoff_pending',
        reservation_request_id = p_reservation_id,
        claimed_by = v_user,
        claimed_at = now(),
        released_at = NULL,
        updated_at = now()
    WHERE co.id = v_row.id
    RETURNING * INTO v_row;
  END IF;

  RETURN QUERY SELECT v_row.ownership_status, v_row.id, v_row.claimed_by;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_reservation_conversation_handoff(
  p_reservation_id uuid,
  p_restaurant_phone text
)
RETURNS TABLE (ownership_status text, ownership_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_guest_phone text;
  v_row public.reservation_conversation_ownership%ROWTYPE;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    WHERE sr.user_id = v_user AND sr.is_active = true AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Manager access required' USING ERRCODE = '42501';
  END IF;

  IF p_reservation_id IS NULL OR p_restaurant_phone IS NULL OR
     p_restaurant_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Invalid handoff details' USING ERRCODE = '22023';
  END IF;

  SELECT rr.customer_phone INTO v_guest_phone
  FROM public.reservation_requests rr WHERE rr.id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_row
  FROM public.reservation_conversation_ownership co
  WHERE co.restaurant_phone = p_restaurant_phone
    AND co.guest_phone = v_guest_phone
  FOR UPDATE;

  IF NOT FOUND OR v_row.ownership_status <> 'handoff_pending' OR
     v_row.claimed_by IS DISTINCT FROM v_user OR
     v_row.reservation_request_id <> p_reservation_id THEN
    RAISE EXCEPTION 'No pending handoff owned by this manager' USING ERRCODE = '22023';
  END IF;

  UPDATE public.reservation_conversation_ownership co
  SET ownership_status = 'automation',
      claimed_by = NULL,
      claimed_at = NULL,
      released_at = NULL,
      updated_at = now()
  WHERE co.id = v_row.id
  RETURNING * INTO v_row;

  RETURN QUERY SELECT v_row.ownership_status, v_row.id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_reservation_conversation_handoff(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_reservation_conversation_handoff(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_reservation_conversation_handoff(uuid,text) FROM anon;
REVOKE ALL ON FUNCTION public.cancel_reservation_conversation_handoff(uuid,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.request_reservation_conversation_handoff(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_reservation_conversation_handoff(uuid,text) TO authenticated;

COMMENT ON FUNCTION public.request_reservation_conversation_handoff(uuid,text)
IS 'Stage 2: reserve a pending handoff only. Does not activate staff messaging.';
COMMENT ON FUNCTION public.cancel_reservation_conversation_handoff(uuid,text)
IS 'Stage 2: cancel a pending handoff by the original requesting manager.';
COMMIT;
