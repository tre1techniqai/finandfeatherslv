-- Fin & Feathers Las Vegas
-- Authorized manager actions for reservation requests
-- LOCAL DRAFT: Review and approve before applying to production.
-- No table or column changes. No Twilio integration.
-- Deploy as a privileged database owner capable of updating reservation_requests.

BEGIN;

CREATE OR REPLACE FUNCTION public.manage_reservation_request(
    p_reservation_id uuid,
    p_action text,
    p_note text DEFAULT NULL
)
RETURNS TABLE (
    reservation_id uuid,
    resulting_status text,
    resulting_deposit_status text,
    action_performed text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_manager_id uuid := auth.uid();
    v_authorized_manager uuid;
    v_request public.reservation_requests%ROWTYPE;
    v_action text := lower(btrim(coalesce(p_action, '')));
    v_note text := nullif(btrim(p_note), '');
    v_expected_amount numeric(10,2);
    v_timestamp timestamptz;
    v_entry text;
BEGIN
    IF v_manager_id IS NULL THEN
        RAISE EXCEPTION 'Manager authorization required' USING ERRCODE = '42501';
    END IF;

    -- Hold a row lock on the manager record until this transaction ends.
    -- A concurrent UPDATE or DELETE of this role must wait for the action.
    SELECT sr.user_id INTO v_authorized_manager
    FROM public.staff_roles AS sr
    WHERE sr.user_id = v_manager_id
      AND sr.role = 'manager'
      AND sr.is_active = true
    FOR SHARE;

    IF v_authorized_manager IS NULL THEN
        RAISE EXCEPTION 'Manager authorization required' USING ERRCODE = '42501';
    END IF;

    IF p_reservation_id IS NULL THEN
        RAISE EXCEPTION 'Reservation ID is required' USING ERRCODE = '22023';
    END IF;

    IF v_action NOT IN (
        'verify_deposit', 'confirm', 'update_notes',
        'close', 'cancel', 'complete'
    ) THEN
        RAISE EXCEPTION 'Unsupported reservation action' USING ERRCODE = '22023';
    END IF;

    IF p_note IS NOT NULL AND char_length(p_note) > 2000 THEN
        RAISE EXCEPTION 'Note exceeds 2000 characters' USING ERRCODE = '22023';
    END IF;

    IF v_action IN ('update_notes', 'close', 'cancel') AND v_note IS NULL THEN
        RAISE EXCEPTION 'A reason or note is required' USING ERRCODE = '22023';
    END IF;

    IF v_action IN ('verify_deposit', 'confirm', 'complete') AND p_note IS NOT NULL THEN
        RAISE EXCEPTION 'This action does not accept a note' USING ERRCODE = '22023';
    END IF;

    IF v_note IS NOT NULL AND v_note ~ '[[:cntrl:]]' THEN
        -- Allow ordinary line breaks and tabs; reject other control characters.
        IF replace(replace(replace(v_note, E'\r', ''), E'\n', ''), E'\t', '') ~ '[[:cntrl:]]' THEN
            RAISE EXCEPTION 'Note contains unsupported control characters' USING ERRCODE = '22023';
        END IF;
    END IF;

    -- Serialize actions on the reservation to avoid lost updates.
    SELECT * INTO v_request
    FROM public.reservation_requests AS rr
    WHERE rr.id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_request.request_status = 'closed' THEN
        RAISE EXCEPTION 'Closed reservations cannot be modified' USING ERRCODE = '22023';
    END IF;

    -- Capture the action time after potentially waiting on locks.
    v_timestamp := clock_timestamp();

    IF v_request.party_size BETWEEN 9 AND 10 THEN
        v_expected_amount := 55.00;
    ELSIF v_request.party_size BETWEEN 11 AND 14 THEN
        v_expected_amount := 80.00;
    ELSIF v_request.party_size BETWEEN 15 AND 20 THEN
        v_expected_amount := 110.00;
    ELSE
        v_expected_amount := NULL;
    END IF;

    IF v_action = 'verify_deposit' THEN
        IF v_request.request_status NOT IN ('pending', 'incomplete')
           OR NOT v_request.details_validated
           OR v_expected_amount IS NULL
           OR v_request.deposit_amount IS DISTINCT FROM v_expected_amount
           OR v_request.deposit_status <> 'pending' THEN
            RAISE EXCEPTION 'Deposit is not eligible for verification' USING ERRCODE = '22023';
        END IF;

        UPDATE public.reservation_requests AS rr
        SET deposit_status = 'verified', updated_at = v_timestamp
        WHERE rr.id = p_reservation_id;

    ELSIF v_action = 'confirm' THEN
        IF v_request.request_status NOT IN ('pending', 'incomplete')
           OR NOT v_request.details_validated
           OR nullif(btrim(v_request.customer_name), '') IS NULL
           OR v_request.reservation_date IS NULL
           OR v_request.reservation_time IS NULL
           OR v_request.party_size IS NULL
           OR v_request.party_size NOT BETWEEN 1 AND 20 THEN
            RAISE EXCEPTION 'Reservation details are not ready for confirmation' USING ERRCODE = '22023';
        END IF;

        IF (v_expected_amount IS NULL AND (
                v_request.deposit_amount IS NOT NULL
                OR v_request.deposit_status <> 'not_required'
            ))
           OR (v_expected_amount IS NOT NULL AND (
                v_request.deposit_amount IS DISTINCT FROM v_expected_amount
                OR v_request.deposit_status <> 'verified'
            )) THEN
            RAISE EXCEPTION 'Deposit requirements are not satisfied' USING ERRCODE = '22023';
        END IF;

        UPDATE public.reservation_requests AS rr
        SET request_status = 'confirmed',
            confirmed_at = v_timestamp,
            updated_at = v_timestamp
        WHERE rr.id = p_reservation_id;

    ELSIF v_action = 'update_notes' THEN
        v_entry := 'STAFF NOTE';

    ELSIF v_action = 'close' THEN
        IF v_request.request_status NOT IN ('pending', 'incomplete', 'unvalidated') THEN
            RAISE EXCEPTION 'Only unconfirmed requests can be closed' USING ERRCODE = '22023';
        END IF;
        v_entry := 'CLOSED WITHOUT CONFIRMATION';

    ELSIF v_action = 'cancel' THEN
        IF v_request.request_status <> 'confirmed' THEN
            RAISE EXCEPTION 'Only confirmed reservations can be canceled' USING ERRCODE = '22023';
        END IF;
        v_entry := 'CANCELED - RESTAURANT INITIATED';

    ELSIF v_action = 'complete' THEN
        IF v_request.request_status <> 'confirmed'
           OR v_request.reservation_date IS NULL
           OR v_request.reservation_time IS NULL THEN
            RAISE EXCEPTION 'Only scheduled confirmed reservations can be completed' USING ERRCODE = '22023';
        END IF;

        IF v_timestamp < ((v_request.reservation_date + v_request.reservation_time)
                          AT TIME ZONE 'America/Los_Angeles') THEN
            RAISE EXCEPTION 'Scheduled reservation time has not arrived' USING ERRCODE = '22023';
        END IF;
        v_entry := 'COMPLETED';
    END IF;

    IF v_entry IS NOT NULL THEN
        -- Indent user text so embedded newlines cannot mimic entry headers.
        v_entry := format('[%s] [%s] %s%s',
            to_char(v_timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
            v_manager_id::text,
            v_entry,
            CASE WHEN v_note IS NULL THEN ''
                 ELSE E'\n  ' || replace(replace(v_note, E'\r\n', E'\n'), E'\n', E'\n  ')
            END
        );

        UPDATE public.reservation_requests AS rr
        SET staff_notes = CASE
                WHEN rr.staff_notes IS NULL OR rr.staff_notes = '' THEN v_entry
                ELSE rr.staff_notes || E'\n\n' || v_entry
            END,
            request_status = CASE
                WHEN v_action IN ('close', 'cancel', 'complete') THEN 'closed'
                ELSE rr.request_status
            END,
            closed_at = CASE
                WHEN v_action IN ('close', 'cancel', 'complete') THEN v_timestamp
                ELSE rr.closed_at
            END,
            updated_at = v_timestamp
        WHERE rr.id = p_reservation_id;
    END IF;

    RETURN QUERY
    SELECT rr.id, rr.request_status, rr.deposit_status, v_action
    FROM public.reservation_requests AS rr
    WHERE rr.id = p_reservation_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.manage_reservation_request(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.manage_reservation_request(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.manage_reservation_request(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.manage_reservation_request(uuid, text, text) IS
'Active-manager-only reservation transitions, deposit verification, and append-only operational notes.';

COMMIT;
