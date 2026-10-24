-- Fin & Feathers Las Vegas
-- Stage 1: durable conversation ownership storage ONLY.
-- No Twilio routing changes, no live takeover, no guest SMS sends.
-- Review before applying through Supabase SQL Editor or migration workflow.

BEGIN;

CREATE TABLE IF NOT EXISTS public.reservation_conversation_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_phone text NOT NULL,
  restaurant_phone text NOT NULL,
  reservation_request_id uuid NOT NULL
    REFERENCES public.reservation_requests(id) ON DELETE RESTRICT,
  ownership_status text NOT NULL DEFAULT 'automation',
  claimed_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz NULL,
  released_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT reservation_conversation_ownership_pair_unique
    UNIQUE (restaurant_phone, guest_phone),
  CONSTRAINT reservation_conversation_ownership_guest_phone_format
    CHECK (guest_phone ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT reservation_conversation_ownership_restaurant_phone_format
    CHECK (restaurant_phone ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT reservation_conversation_ownership_different_phones
    CHECK (guest_phone <> restaurant_phone),
  CONSTRAINT reservation_conversation_ownership_status_valid
    CHECK (ownership_status IN (
      'automation',
      'handoff_pending',
      'staff',
      'released'
    )),
  CONSTRAINT reservation_conversation_ownership_staff_claim_required
    CHECK (
      ownership_status <> 'staff'
      OR (claimed_by IS NOT NULL AND claimed_at IS NOT NULL)
    ),
  CONSTRAINT reservation_conversation_ownership_release_time_valid
    CHECK (ownership_status <> 'released' OR released_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS reservation_conversation_ownership_reservation_idx
  ON public.reservation_conversation_ownership (reservation_request_id);

-- Defense in depth: no direct browser/client reads or writes.
-- A future server-controlled transactional API will own all mutations.
ALTER TABLE public.reservation_conversation_ownership ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.reservation_conversation_ownership FROM PUBLIC;
REVOKE ALL ON TABLE public.reservation_conversation_ownership FROM anon;
REVOKE ALL ON TABLE public.reservation_conversation_ownership FROM authenticated;

COMMENT ON TABLE public.reservation_conversation_ownership IS
  'One record per restaurant/guest SMS phone pair. Stage 1 storage only; no handoff or inbound routing is enabled.';

COMMIT;
