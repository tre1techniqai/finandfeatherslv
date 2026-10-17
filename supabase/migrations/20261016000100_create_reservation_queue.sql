-- Fin & Feathers Las Vegas
-- Reservation Follow-Up Queue
-- Local migration draft: do not execute until reviewed.

CREATE TABLE public.reservation_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    twilio_execution_sid text NOT NULL UNIQUE,

    customer_phone text NOT NULL,
    customer_name text,
    reservation_date date,
    reservation_time time without time zone,
    party_size integer,
    occasion text,
    email text,
    vip_preference text,

    request_status text NOT NULL DEFAULT 'pending',
    details_validated boolean NOT NULL DEFAULT false,

    interruption_reason text,
    interruption_stage text,

    deposit_amount numeric(10,2),
    deposit_status text NOT NULL DEFAULT 'not_required',

    staff_notes text,
    confirmed_at timestamptz,
    closed_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT reservation_party_size_check
        CHECK (party_size IS NULL OR party_size BETWEEN 1 AND 20),

    CONSTRAINT reservation_status_check
        CHECK (
            request_status IN (
                'pending',
                'incomplete',
                'unvalidated',
                'confirmed',
                'closed'
            )
        ),

    CONSTRAINT reservation_vip_check
        CHECK (
            vip_preference IS NULL
            OR vip_preference IN (
                'YES',
                'NO',
                'NEEDS STAFF FOLLOW-UP'
            )
        ),

    CONSTRAINT reservation_deposit_status_check
        CHECK (
            deposit_status IN (
                'not_required',
                'pending',
                'verified',
                'waived'
            )
        ),

    CONSTRAINT reservation_confirmation_check
        CHECK (
            request_status <> 'confirmed'
            OR (
                details_validated = true
                AND customer_name IS NOT NULL
                AND reservation_date IS NOT NULL
                AND reservation_time IS NOT NULL
                AND party_size IS NOT NULL
            )
        ),

    CONSTRAINT reservation_unvalidated_details_check
        CHECK (
            details_validated = true
            OR (
                customer_name IS NULL
                AND reservation_date IS NULL
                AND reservation_time IS NULL
                AND party_size IS NULL
                AND occasion IS NULL
            )
        )
);

CREATE TABLE public.reservation_notification_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    reservation_request_id uuid NOT NULL
        REFERENCES public.reservation_requests(id)
        ON DELETE CASCADE,

    event_key text NOT NULL UNIQUE,

    notification_type text NOT NULL,
    notification_status text NOT NULL DEFAULT 'pending',

    twilio_message_sid text,
    failure_code text,
    failure_description text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT reservation_notification_type_check
        CHECK (
            notification_type IN (
                'new_reservation',
                'incomplete_reservation',
                'unvalidated_reservation'
            )
        ),

    CONSTRAINT reservation_notification_status_check
        CHECK (
            notification_status IN (
                'pending',
                'sent',
                'delivered',
                'failed',
                'unknown'
            )
        )
);

CREATE UNIQUE INDEX reservation_notification_message_sid_unique
    ON public.reservation_notification_events (twilio_message_sid)
    WHERE twilio_message_sid IS NOT NULL;

CREATE INDEX reservation_requests_status_created_idx
    ON public.reservation_requests (request_status, created_at DESC);

CREATE INDEX reservation_notification_request_idx
    ON public.reservation_notification_events (reservation_request_id);

ALTER TABLE public.reservation_requests
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reservation_notification_events
    ENABLE ROW LEVEL SECURITY;

-- Only active managers can read reservation requests.
CREATE POLICY reservation_requests_manager_select
ON public.reservation_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.staff_roles
        WHERE staff_roles.user_id = (SELECT auth.uid())
          AND staff_roles.role = 'manager'
          AND staff_roles.is_active = true
    )
);

-- Only active managers can read notification history.
CREATE POLICY reservation_notifications_manager_select
ON public.reservation_notification_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.staff_roles
        WHERE staff_roles.user_id = (SELECT auth.uid())
          AND staff_roles.role = 'manager'
          AND staff_roles.is_active = true
    )
);

-- No direct authenticated INSERT, UPDATE or DELETE policies.
-- Server-side ingestion will use a protected service-role client.
-- Staff write operations will require separately designed authorization.

COMMENT ON TABLE public.reservation_requests IS
'Fin & Feathers reservation requests. A request is not a confirmed reservation.';

COMMENT ON TABLE public.reservation_notification_events IS
'Notification attempts and delivery outcomes for reservation staff alerts.';
