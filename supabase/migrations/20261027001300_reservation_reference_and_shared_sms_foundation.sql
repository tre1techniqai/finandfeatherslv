-- FIN & FEATHERS LV — reservation references + shared staff SMS storage
-- ADDITIVE FOUNDATION ONLY. No activation, routing changes, or message sends.
-- REVIEW BEFORE DEPLOYMENT. Requires a verified backup and schema preflight.
-- Not executed against production by this file creation.
-- Existing reservation rows remain untouched; references assigned to NEW rows only.
BEGIN;

-- 1. Guest-facing reference, internal reservation UUID remains authoritative.
ALTER TABLE public.reservation_requests
  ADD COLUMN IF NOT EXISTS reservation_reference text;

ALTER TABLE public.reservation_requests
  ADD CONSTRAINT reservation_reference_format_check
  CHECK (reservation_reference IS NULL OR
         reservation_reference ~ '^[A-Z]{2}-[0-9]{6}-[0-9]{3,8}$');

CREATE UNIQUE INDEX reservation_requests_reference_unique
  ON public.reservation_requests (reservation_reference)
  WHERE reservation_reference IS NOT NULL;

CREATE FUNCTION public.assign_reservation_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $fn$
DECLARE
  v_date_code text;
  v_name text;
  v_parts text[];
  v_initials text := 'FF';
  v_sequence bigint;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.reservation_reference IS DISTINCT FROM OLD.reservation_reference THEN
      RAISE EXCEPTION 'Reservation reference is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.reservation_reference IS NOT NULL THEN
    RAISE EXCEPTION 'Reservation reference is assigned by the database' USING ERRCODE = '23514';
  END IF;

  -- Reservation date when known; creation date fallback for incomplete requests.
  v_date_code := pg_catalog.to_char(
    COALESCE(NEW.reservation_date,
      (COALESCE(NEW.created_at, now()) AT TIME ZONE 'America/Los_Angeles')::date),
    'YYMMDD'
  );

  v_name := pg_catalog.btrim(pg_catalog.regexp_replace(
    pg_catalog.upper(COALESCE(NEW.customer_name, '')),
    '[^A-Z ]', ' ', 'g'
  ));
  v_parts := pg_catalog.regexp_split_to_array(v_name, '[[:space:]]+');
  IF pg_catalog.array_length(v_parts, 1) >= 2
     AND pg_catalog.length(v_parts[1]) > 0
     AND pg_catalog.length(v_parts[pg_catalog.array_length(v_parts, 1)]) > 0 THEN
    v_initials := pg_catalog.left(v_parts[1], 1) ||
      pg_catalog.left(v_parts[pg_catalog.array_length(v_parts, 1)], 1);
  END IF;

  -- Serializes all concurrent allocations for the same date, across initials.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ff:reservation-reference:' || v_date_code, 0));

  SELECT COALESCE(MAX(pg_catalog.split_part(r.reservation_reference, '-', 3)::bigint), 0) + 1
    INTO v_sequence
  FROM public.reservation_requests r
  WHERE pg_catalog.split_part(r.reservation_reference, '-', 2) = v_date_code;

  IF v_sequence > 99999999 THEN
    RAISE EXCEPTION 'Reservation reference sequence exhausted' USING ERRCODE = '22003';
  END IF;

  NEW.reservation_reference := v_initials || '-' || v_date_code || '-' ||
    pg_catalog.lpad(v_sequence::text, 3, '0');
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER reservation_reference_on_insert
  BEFORE INSERT ON public.reservation_requests
  FOR EACH ROW EXECUTE FUNCTION public.assign_reservation_reference();

CREATE TRIGGER reservation_reference_on_update
  BEFORE UPDATE ON public.reservation_requests
  FOR EACH ROW EXECUTE FUNCTION public.assign_reservation_reference();

REVOKE ALL ON FUNCTION public.assign_reservation_reference()
  FROM PUBLIC, anon, authenticated;

-- 2. Conversation: one row per reservation, NOT per phone pair.
-- Phone pair is transport metadata only and never unique.
CREATE TABLE public.reservation_shared_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_request_id uuid NOT NULL UNIQUE
    REFERENCES public.reservation_requests(id) ON DELETE RESTRICT,
  -- Composite target guarantees that SMS operations cannot mix reservations.
  CONSTRAINT shared_conversation_id_reservation_unique
    UNIQUE (id, reservation_request_id),
  restaurant_phone text NOT NULL
    CHECK (restaurant_phone ~ '^\+[1-9][0-9]{7,14}$'),
  guest_phone text NOT NULL
    CHECK (guest_phone ~ '^\+[1-9][0-9]{7,14}$'),
  mode text NOT NULL DEFAULT 'automation'
    CHECK (mode IN ('automation', 'transitioning_to_staff', 'staff')),
  mode_version bigint NOT NULL DEFAULT 1 CHECK (mode_version > 0),
  staff_activated_at timestamptz,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (restaurant_phone <> guest_phone),
  CHECK (mode <> 'staff' OR staff_activated_at IS NOT NULL)
);

CREATE INDEX reservation_shared_conversations_phone_idx
  ON public.reservation_shared_conversations (restaurant_phone, guest_phone);
CREATE INDEX reservation_shared_conversations_activity_idx
  ON public.reservation_shared_conversations (last_activity_at DESC, id DESC);

-- 3. Idempotent outbound submissions, attributed to staff, not owned by staff.
CREATE TABLE public.reservation_shared_sms_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  reservation_request_id uuid NOT NULL
    REFERENCES public.reservation_requests(id) ON DELETE RESTRICT,
  -- Reservation and conversation must point to the SAME reservation.
  CONSTRAINT shared_sms_operation_conversation_reservation_fk
    FOREIGN KEY (conversation_id, reservation_request_id)
    REFERENCES public.reservation_shared_conversations (id, reservation_request_id)
    ON DELETE RESTRICT,
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  client_request_id uuid NOT NULL UNIQUE,
  message_body text NOT NULL CHECK (
    char_length(btrim(message_body)) BETWEEN 1 AND 1600
    AND message_body !~ '[\x00-\x08\x0B\x0C\x0E-\x1F]'
  ),
  status text NOT NULL DEFAULT 'registered' CHECK (
    status IN ('registered','submitting','accepted','rejected','uncertain','cancelled')),
  twilio_message_sid text UNIQUE CHECK (
    twilio_message_sid IS NULL OR twilio_message_sid ~ '^SM[0-9a-fA-F]{32}$'),
  outcome_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'accepted' OR twilio_message_sid IS NOT NULL),
  CHECK (status = 'accepted' OR twilio_message_sid IS NULL),
  CHECK (
    (status = 'registered' AND started_at IS NULL AND completed_at IS NULL) OR
    (status IN ('submitting','uncertain') AND started_at IS NOT NULL AND completed_at IS NULL) OR
    (status IN ('accepted','rejected') AND started_at IS NOT NULL AND completed_at IS NOT NULL) OR
    (status = 'cancelled' AND started_at IS NULL AND completed_at IS NOT NULL)
  )
);
CREATE INDEX reservation_shared_sms_reservation_idx
  ON public.reservation_shared_sms_operations (reservation_request_id, created_at DESC);
CREATE INDEX reservation_shared_sms_pending_idx
  ON public.reservation_shared_sms_operations (conversation_id, created_at)
  WHERE status IN ('registered','submitting','uncertain');

-- 4. Inbound metadata: no assumption that one phone pair has one reservation.
-- A future authenticated/verified writer must resolve the reservation context.
CREATE TABLE public.reservation_shared_inbound_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL
    REFERENCES public.reservation_shared_conversations(id) ON DELETE RESTRICT,
  twilio_message_sid text NOT NULL UNIQUE
    CHECK (twilio_message_sid ~ '^SM[0-9a-fA-F]{32}$'),
  message_created_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reservation_shared_inbound_history_idx
  ON public.reservation_shared_inbound_events
    (conversation_id, message_created_at DESC, id DESC);

-- Default-deny: NO browser or application-facing table grants or policies.
ALTER TABLE public.reservation_shared_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_shared_sms_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_shared_inbound_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.reservation_shared_conversations FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.reservation_shared_sms_operations FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.reservation_shared_inbound_events FROM PUBLIC, anon, authenticated, service_role;

COMMIT;