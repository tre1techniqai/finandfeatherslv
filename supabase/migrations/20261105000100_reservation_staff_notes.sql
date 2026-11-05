
-- Fin & Feathers Las Vegas
-- Reservation-specific staff notes and read tracking.
--
-- Additive migration:
--   - No changes to existing reservation tables
--   - No changes to existing RLS policies
--   - No changes to Twilio or booking workflows
--
-- All writes are reserved for protected server-side APIs.

BEGIN;

-- ============================================================
-- 1. Reservation staff notes
-- ============================================================

CREATE TABLE public.reservation_staff_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    reservation_request_id uuid NOT NULL
        REFERENCES public.reservation_requests(id)
        ON DELETE CASCADE,

    parent_note_id uuid,

    author_user_id uuid NOT NULL
        REFERENCES auth.users(id),

    author_email text NOT NULL,

    body text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT reservation_staff_notes_body_check
        CHECK (
            char_length(body) BETWEEN 1 AND 4000
            AND body = btrim(body)
        ),

    CONSTRAINT reservation_staff_notes_email_check
        CHECK (
            char_length(author_email) BETWEEN 3 AND 254
            AND author_email = btrim(author_email)
        ),

    CONSTRAINT reservation_staff_notes_not_self_reply
        CHECK (
            parent_note_id IS NULL
            OR parent_note_id <> id
        ),

    CONSTRAINT reservation_staff_notes_id_reservation_unique
        UNIQUE (id, reservation_request_id),

    CONSTRAINT reservation_staff_notes_parent_same_reservation
        FOREIGN KEY (
            parent_note_id,
            reservation_request_id
        )
        REFERENCES public.reservation_staff_notes (
            id,
            reservation_request_id
        )
);

CREATE INDEX reservation_staff_notes_reservation_created_idx
    ON public.reservation_staff_notes (
        reservation_request_id,
        created_at,
        id
    );

CREATE INDEX reservation_staff_notes_parent_idx
    ON public.reservation_staff_notes (
        parent_note_id
    )
    WHERE parent_note_id IS NOT NULL;

-- ============================================================
-- 2. Per-user reservation note read position
-- ============================================================

CREATE TABLE public.reservation_staff_note_reads (
    reservation_request_id uuid NOT NULL
        REFERENCES public.reservation_requests(id)
        ON DELETE CASCADE,

    user_id uuid NOT NULL
        REFERENCES auth.users(id),

    last_read_at timestamptz,

    PRIMARY KEY (
        reservation_request_id,
        user_id
    )
);

-- A NULL last_read_at means that the staff member has
-- not yet acknowledged any notes on that reservation.

-- ============================================================
-- 3. Row Level Security
-- ============================================================

ALTER TABLE public.reservation_staff_notes
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reservation_staff_note_reads
    ENABLE ROW LEVEL SECURITY;

-- Active managers and reservation agents can read notes.
-- Notes are reservation-specific through their foreign key.

CREATE POLICY reservation_staff_notes_staff_select
ON public.reservation_staff_notes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.staff_roles AS sr
        WHERE sr.user_id = (SELECT auth.uid())
          AND sr.is_active = true
          AND sr.role IN ('manager', 'reservation_agent')
    )
    AND EXISTS (
        SELECT 1
        FROM public.reservation_requests AS rr
        WHERE rr.id = reservation_request_id
    )
);

-- Staff may read only their own read-position records.

CREATE POLICY reservation_staff_note_reads_own_select
ON public.reservation_staff_note_reads
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    AND EXISTS (
        SELECT 1
        FROM public.staff_roles AS sr
        WHERE sr.user_id = (SELECT auth.uid())
          AND sr.is_active = true
          AND sr.role IN ('manager', 'reservation_agent')
    )
    AND EXISTS (
        SELECT 1
        FROM public.reservation_requests AS rr
        WHERE rr.id = reservation_request_id
    )
);

-- ============================================================
-- 4. Explicit table privileges
-- ============================================================

-- No anonymous access or direct authenticated writes.
-- Protected APIs will perform authorized writes server-side.

REVOKE ALL
ON TABLE
    public.reservation_staff_notes,
    public.reservation_staff_note_reads
FROM PUBLIC, anon, authenticated;

GRANT SELECT
ON TABLE
    public.reservation_staff_notes,
    public.reservation_staff_note_reads
TO authenticated;

GRANT ALL
ON TABLE
    public.reservation_staff_notes,
    public.reservation_staff_note_reads
TO service_role;

-- ============================================================
-- 5. Documentation
-- ============================================================

COMMENT ON TABLE public.reservation_staff_notes IS
    'Internal reservation-specific staff notes and replies. No guest messaging.';

COMMENT ON COLUMN public.reservation_staff_notes.parent_note_id IS
    'Parent note UUID for a reply; must belong to the same reservation.';

COMMENT ON COLUMN public.reservation_staff_notes.author_email IS
    'Login email snapshot obtained from the authenticated user by the protected server API.';

COMMENT ON TABLE public.reservation_staff_note_reads IS
    'Per-user read position for internal reservation staff notes.';

COMMENT ON COLUMN public.reservation_staff_note_reads.last_read_at IS
    'Latest acknowledged note creation timestamp. NULL means no notes acknowledged.';

COMMIT;