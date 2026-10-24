-- Fin & Feathers Las Vegas
-- Guest Assistance Required: persistent staff alert foundation.
-- Review before applying to Supabase. Does not modify existing tables/functions.

CREATE TABLE public.reservation_guest_assistance_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    reservation_request_id uuid NOT NULL
        REFERENCES public.reservation_requests(id) ON DELETE CASCADE,

    -- Incoming guest message SID, never the outbound acknowledgement SID.
    twilio_message_sid text NOT NULL UNIQUE,

    alert_status text NOT NULL DEFAULT 'open',
    acknowledged_by uuid REFERENCES auth.users(id),
    acknowledged_at timestamptz,
    resolved_by uuid REFERENCES auth.users(id),
    resolved_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT guest_assistance_message_sid_format_check
        CHECK (twilio_message_sid ~ '^SM[0-9a-fA-F]{32}$'),

    CONSTRAINT guest_assistance_alert_status_check
        CHECK (alert_status IN ('open', 'acknowledged', 'resolved')),

    CONSTRAINT guest_assistance_acknowledgement_consistency_check
        CHECK (
            (acknowledged_by IS NULL AND acknowledged_at IS NULL)
            OR (acknowledged_by IS NOT NULL AND acknowledged_at IS NOT NULL)
        ),

    CONSTRAINT guest_assistance_resolution_consistency_check
        CHECK (
            (resolved_by IS NULL AND resolved_at IS NULL)
            OR (resolved_by IS NOT NULL AND resolved_at IS NOT NULL)
        ),

    CONSTRAINT guest_assistance_state_consistency_check
        CHECK (
            alert_status = 'open'
            OR (alert_status = 'acknowledged' AND acknowledged_by IS NOT NULL)
            OR (alert_status = 'resolved' AND resolved_by IS NOT NULL)
        )
);

CREATE INDEX reservation_guest_assistance_open_idx
    ON public.reservation_guest_assistance_alerts (created_at DESC)
    WHERE alert_status <> 'resolved';

CREATE INDEX reservation_guest_assistance_reservation_idx
    ON public.reservation_guest_assistance_alerts
    (reservation_request_id, created_at DESC);

ALTER TABLE public.reservation_guest_assistance_alerts
    ENABLE ROW LEVEL SECURITY;

-- Restrict authenticated reads to active reservation managers.
CREATE POLICY guest_assistance_manager_select
ON public.reservation_guest_assistance_alerts
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

-- No INSERT, UPDATE or DELETE policies for authenticated users.
-- Only a trusted server-side API using the service role may record alerts.
-- Manager acknowledgement/resolution will use separately reviewed,
-- security-checked server-side operations in a later step.
REVOKE ALL ON TABLE public.reservation_guest_assistance_alerts
    FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.reservation_guest_assistance_alerts
    TO authenticated;
GRANT ALL ON TABLE public.reservation_guest_assistance_alerts
    TO service_role;

COMMENT ON TABLE public.reservation_guest_assistance_alerts IS
'Incoming guest SMS messages requiring manager attention; independent of notification delivery and conversation ownership.';

COMMENT ON COLUMN public.reservation_guest_assistance_alerts.twilio_message_sid IS
'Unique inbound Twilio SMS SID used for idempotent alert recording; message body remains in Twilio conversation history.';
