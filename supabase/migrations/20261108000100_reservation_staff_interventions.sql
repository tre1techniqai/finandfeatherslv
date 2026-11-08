-- Fin & Feathers Las Vegas
-- Reservation staff interventions: foundation and guarded start.
--
-- This migration does not:
-- - Send SMS
-- - Change Twilio Studio executions
-- - Change original alternative offers
-- - Change reservation dates or times
-- - Activate or resume conversation automation

BEGIN;

CREATE TABLE public.reservation_staff_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  reservation_request_id uuid NOT NULL
    REFERENCES public.reservation_requests(id)
    ON DELETE RESTRICT,

  conversation_id uuid NOT NULL,

  request_key uuid NOT NULL UNIQUE,

  intervention_type text NOT NULL
    CHECK (
      intervention_type ~ '^[a-z][a-z0-9_]{2,63}$'
    ),

  status text NOT NULL DEFAULT 'draft'
    CHECK (
      status IN (
        'draft',
        'awaiting_guest',
        'staff_review',
        'resolved',
        'canceled'
      )
    ),

  details jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (
      jsonb_typeof(details) = 'object'
      AND octet_length(details::text) <= 8192
    ),

  resolution jsonb
    CHECK (
      resolution IS NULL
      OR jsonb_typeof(resolution) = 'object'
    ),

  initiated_by uuid NOT NULL
    REFERENCES auth.users(id),

  assigned_to uuid
    REFERENCES auth.users(id),

  mode_version_at_start bigint NOT NULL
    CHECK (mode_version_at_start >= 1),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,

  CONSTRAINT intervention_conversation_association_fk
    FOREIGN KEY (
      conversation_id,
      reservation_request_id
    )
    REFERENCES public.reservation_shared_conversations (
      id,
      reservation_request_id
    )
    ON DELETE RESTRICT,

  CONSTRAINT intervention_resolution_consistency
    CHECK (
      (
        status IN ('resolved', 'canceled')
        AND resolved_at IS NOT NULL
      )
      OR
      (
        status NOT IN ('resolved', 'canceled')
        AND resolved_at IS NULL
      )
    )
);

-- Multiple historical interventions are permitted.
-- Only one can be active for a reservation.

CREATE UNIQUE INDEX
  reservation_staff_interventions_one_active_idx
ON public.reservation_staff_interventions (
  reservation_request_id
)
WHERE status IN (
  'draft',
  'awaiting_guest',
  'staff_review'
);

CREATE INDEX
  reservation_staff_interventions_history_idx
ON public.reservation_staff_interventions (
  reservation_request_id,
  created_at DESC
);

-- No direct access for browser clients.

ALTER TABLE public.reservation_staff_interventions
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.reservation_staff_interventions
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.reservation_staff_interventions
TO service_role;

-- Staff may begin an intervention only AFTER
-- the existing conversation handoff has completed.
--
-- No SMS or automation side effects occur here.

CREATE FUNCTION public.start_reservation_staff_intervention(
  p_reservation_id uuid,
  p_conversation_id uuid,
  p_expected_mode_version bigint,
  p_request_key uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

REVOKE ALL ON FUNCTION
  public.start_reservation_staff_intervention(
    uuid, uuid, bigint, uuid
  )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.start_reservation_staff_intervention(
    uuid, uuid, bigint, uuid
  )
TO authenticated;

COMMIT;