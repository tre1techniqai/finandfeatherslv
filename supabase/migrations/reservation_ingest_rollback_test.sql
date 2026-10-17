-- Fin & Feathers Las Vegas
-- Atomic reservation ingestion
--
-- LOCAL DRAFT: Do not execute in production until reviewed.
--
-- Notification event key:
-- EXECUTION_SID:NOTIFICATION_TYPE:INTERRUPTION_STAGE
--
-- This function is callable only by service_role.

BEGIN;

CREATE OR REPLACE FUNCTION public.ingest_reservation_request(
    p_twilio_execution_sid text,
    p_customer_phone text,
    p_request_status text,
    p_details_validated boolean,
    p_customer_name text DEFAULT NULL,
    p_reservation_date date DEFAULT NULL,
    p_reservation_time time without time zone DEFAULT NULL,
    p_party_size integer DEFAULT NULL,
    p_occasion text DEFAULT NULL,
    p_email text DEFAULT NULL,
    p_vip_preference text DEFAULT NULL,
    p_interruption_reason text DEFAULT NULL,
    p_interruption_stage text DEFAULT NULL
)
RETURNS TABLE (
    reservation_id uuid,
    resulting_status text,
    reservation_created boolean,
    notification_created boolean,
    notification_event_key text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_reservation_id uuid;
    v_existing_status text;
    v_existing_validated boolean;
    v_existing_phone text;
    v_resulting_status text;

    v_deposit_amount numeric(10,2);
    v_deposit_status text;

    v_notification_type text;
    v_event_stage text;
    v_event_key text;

    v_reservation_created boolean := false;
    v_notification_created boolean := false;
    v_duplicate_event boolean := false;
BEGIN
    -- Validate the Twilio execution identifier and customer phone.

    p_twilio_execution_sid := UPPER(p_twilio_execution_sid);

    IF p_twilio_execution_sid IS NULL
       OR p_twilio_execution_sid !~* '^FN[0-9a-f]{32}$'
    THEN
        RAISE EXCEPTION 'Invalid Twilio execution SID';
    END IF;

    IF p_customer_phone IS NULL
       OR p_customer_phone !~ '^\+[1-9][0-9]{7,14}$'
    THEN
        RAISE EXCEPTION 'Invalid customer phone';
    END IF;

    IF p_request_status IS NULL
       OR p_request_status NOT IN (
           'pending',
           'incomplete',
           'unvalidated'
       )
    THEN
        RAISE EXCEPTION 'Invalid request status';
    END IF;

    IF p_details_validated IS NULL THEN
        RAISE EXCEPTION 'Validation status is required';
    END IF;

    IF p_request_status = 'pending'
       AND NOT p_details_validated
    THEN
        RAISE EXCEPTION 'Pending requests require validated details';
    END IF;

    IF p_request_status = 'unvalidated'
       AND p_details_validated
    THEN
        RAISE EXCEPTION 'Unvalidated requests cannot contain validated details';
    END IF;

    -- Validate reservation details independently of the API.

    IF p_details_validated THEN

        IF NULLIF(BTRIM(p_customer_name), '') IS NULL
           OR p_reservation_date IS NULL
           OR p_reservation_time IS NULL
           OR p_party_size IS NULL
        THEN
            RAISE EXCEPTION 'Validated reservation details are incomplete';
        END IF;

        IF p_party_size NOT BETWEEN 1 AND 20 THEN
            RAISE EXCEPTION 'Invalid party size';
        END IF;

    ELSE

        IF p_customer_name IS NOT NULL
           OR p_reservation_date IS NOT NULL
           OR p_reservation_time IS NOT NULL
           OR p_party_size IS NOT NULL
           OR p_occasion IS NOT NULL
           OR p_email IS NOT NULL
           OR p_vip_preference IS NOT NULL
        THEN
            RAISE EXCEPTION 'Unvalidated reservation details are not permitted';
        END IF;

    END IF;

    IF p_vip_preference IS NOT NULL
       AND p_vip_preference NOT IN (
           'YES',
           'NO',
           'NEEDS STAFF FOLLOW-UP'
       )
    THEN
        RAISE EXCEPTION 'Invalid VIP preference';
    END IF;

    -- Validate interruption information.

    IF p_request_status = 'pending' THEN

        IF p_interruption_reason IS NOT NULL
           OR p_interruption_stage IS NOT NULL
        THEN
            RAISE EXCEPTION 'Pending requests cannot include interruption details';
        END IF;

    ELSE

        IF p_interruption_reason IS NULL
           OR p_interruption_reason NOT IN (
               'CUSTOMER TIMEOUT',
               'MESSAGE DELIVERY FAILURE'
           )
           OR NULLIF(BTRIM(p_interruption_stage), '') IS NULL
        THEN
            RAISE EXCEPTION 'Valid interruption details are required';
        END IF;

    END IF;

    -- Determine deposit requirements from party size.

    IF NOT p_details_validated OR p_party_size <= 8 THEN
        v_deposit_amount := NULL;
        v_deposit_status := 'not_required';
    ELSIF p_party_size <= 10 THEN
        v_deposit_amount := 55;
        v_deposit_status := 'pending';
    ELSIF p_party_size <= 14 THEN
        v_deposit_amount := 80;
        v_deposit_status := 'pending';
    ELSE
        v_deposit_amount := 110;
        v_deposit_status := 'pending';
    END IF;

    -- Determine notification type.

    IF p_request_status = 'pending' THEN
        v_notification_type := 'new_reservation';
    ELSIF p_details_validated THEN
        v_notification_type := 'incomplete_reservation';
    ELSE
        v_notification_type := 'unvalidated_reservation';
    END IF;

    -- Normalize the interruption stage.

    IF p_interruption_stage IS NULL THEN
        v_event_stage := 'NONE';
    ELSE
        v_event_stage := UPPER(
            REGEXP_REPLACE(
                BTRIM(p_interruption_stage),
                '[^A-Za-z0-9]+',
                '_',
                'g'
            )
        );
    END IF;

    IF v_event_stage = '' THEN
        RAISE EXCEPTION 'Invalid interruption stage';
    END IF;

    -- Serialize requests belonging to the same Twilio execution.
    -- The advisory lock is released automatically at transaction end.

    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
            UPPER(p_twilio_execution_sid),
            0
        )
    );

    -- Lock the existing reservation, if present.

    SELECT
        r.id,
        r.request_status,
        r.details_validated,
        r.customer_phone
    INTO
        v_reservation_id,
        v_existing_status,
        v_existing_validated,
        v_existing_phone
    FROM public.reservation_requests AS r
    WHERE r.twilio_execution_sid = p_twilio_execution_sid
    FOR UPDATE;

    -- Verify customer identity before checking for duplicates.

    IF v_reservation_id IS NOT NULL
    AND v_existing_phone <> p_customer_phone
    THEN
        RAISE EXCEPTION
            'Customer phone mismatch for existing execution';
    END IF;

    -- Classify the notification using the existing reservation status.
    -- Late validated details must not reopen an incomplete reservation.

    IF v_existing_status = 'incomplete' THEN
        IF p_details_validated THEN
            v_notification_type := 'incomplete_reservation';
        ELSE
            v_notification_type := 'unvalidated_reservation';
        END IF;
    ELSIF p_request_status = 'pending' THEN
        v_notification_type := 'new_reservation';
    ELSIF p_details_validated THEN
        v_notification_type := 'incomplete_reservation';
    ELSE
        v_notification_type := 'unvalidated_reservation';
    END IF;

    -- Build the event key after notification classification.

    v_event_key :=
        UPPER(p_twilio_execution_sid)
        || ':'
        || v_notification_type
        || ':'
        || v_event_stage;

    -- Check for duplicate events before modifying the reservation.

    SELECT EXISTS (
        SELECT 1
        FROM public.reservation_notification_events AS e
        WHERE e.event_key = v_event_key
    )
    INTO v_duplicate_event;

    -- Duplicate events must not modify reservations
    -- or generate additional notifications.

    IF v_duplicate_event THEN

        IF v_reservation_id IS NULL THEN
            RAISE EXCEPTION
                'Notification event exists without reservation';
        END IF;

        RETURN QUERY
        SELECT
            v_reservation_id,
            v_existing_status,
            false,
            false,
            v_event_key;

        RETURN;
    END IF;

    -- Staff decisions take precedence over all later chatbot events.

    IF v_existing_status IN ('confirmed', 'closed') THEN

        RETURN QUERY
        SELECT
            v_reservation_id,
            v_existing_status,
            false,
            false,
            v_event_key;

        RETURN;
    END IF;

    -- Create a new reservation if this is its first event.

    IF v_reservation_id IS NULL THEN

        INSERT INTO public.reservation_requests (
            twilio_execution_sid,
            customer_phone,
            customer_name,
            reservation_date,
            reservation_time,
            party_size,
            occasion,
            email,
            vip_preference,
            request_status,
            details_validated,
            interruption_reason,
            interruption_stage,
            deposit_amount,
            deposit_status
        )
        VALUES (
            p_twilio_execution_sid,
            p_customer_phone,
            p_customer_name,
            p_reservation_date,
            p_reservation_time,
            p_party_size,
            p_occasion,
            p_email,
            p_vip_preference,
            CASE
                WHEN p_request_status = 'pending'
                THEN 'pending'
                ELSE 'incomplete'
            END,
            p_details_validated,
            p_interruption_reason,
            p_interruption_stage,
            v_deposit_amount,
            v_deposit_status
        )
        RETURNING id, request_status
        INTO v_reservation_id, v_resulting_status;

        v_reservation_created := true;

    ELSIF v_existing_status = 'pending'
          AND p_request_status <> 'pending'
    THEN

        -- An interruption advances pending to incomplete.
        -- Preserve previously validated information if the new
        -- event does not contain validated details.

        UPDATE public.reservation_requests AS r
        SET
            request_status = 'incomplete',

            details_validated = (
                r.details_validated OR p_details_validated
            ),

            customer_name = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN p_customer_name
                ELSE r.customer_name
            END,

            reservation_date = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN p_reservation_date
                ELSE r.reservation_date
            END,

            reservation_time = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN p_reservation_time
                ELSE r.reservation_time
            END,

            party_size = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN p_party_size
                ELSE r.party_size
            END,

            occasion = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN p_occasion
                ELSE r.occasion
            END,

            email = CASE
                WHEN p_details_validated
                THEN COALESCE(r.email, p_email)
                ELSE r.email
            END,

            vip_preference = CASE
                WHEN p_details_validated
                THEN COALESCE(r.vip_preference, p_vip_preference)
                ELSE r.vip_preference
            END,

            interruption_reason = p_interruption_reason,
            interruption_stage = p_interruption_stage,

            deposit_amount = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN v_deposit_amount
                ELSE r.deposit_amount
            END,

            deposit_status = CASE
                WHEN p_details_validated
                     AND NOT r.details_validated
                THEN v_deposit_status
                ELSE r.deposit_status
            END,

            updated_at = now()
        WHERE r.id = v_reservation_id;

        v_resulting_status := 'incomplete';

        ELSIF v_existing_status = 'incomplete' THEN

        -- Keep the reservation incomplete.
        -- Accept the first validated details if the existing
        -- reservation was previously unvalidated.
        -- Never overwrite already-validated information.

        IF NOT v_existing_validated AND p_details_validated THEN

            UPDATE public.reservation_requests AS r
            SET
                details_validated = true,
                customer_name = p_customer_name,
                reservation_date = p_reservation_date,
                reservation_time = p_reservation_time,
                party_size = p_party_size,
                occasion = p_occasion,
                email = p_email,
                vip_preference = p_vip_preference,
                deposit_amount = v_deposit_amount,
                deposit_status = v_deposit_status,
                updated_at = now()
            WHERE r.id = v_reservation_id
              AND r.details_validated = false;

        END IF;

        -- Preserve the existing interruption reason and stage.
        -- Never change incomplete back to pending.

        v_resulting_status := 'incomplete';

    ELSE

        -- Existing pending reservation; do not overwrite it
        -- with another pending event.

        v_resulting_status := 'pending';

    END IF;

    -- Create the notification event within the same transaction.
    -- A duplicate key does not create a second event.

    INSERT INTO public.reservation_notification_events (
        reservation_request_id,
        event_key,
        notification_type,
        notification_status
    )
    VALUES (
        v_reservation_id,
        v_event_key,
        v_notification_type,
        'pending'
    )
    ON CONFLICT ON CONSTRAINT reservation_notification_events_event_key_key
    DO NOTHING
    RETURNING true INTO v_notification_created;

    RETURN QUERY
    SELECT
        v_reservation_id,
        v_resulting_status,
        v_reservation_created,
        COALESCE(v_notification_created, false),
        v_event_key;
END;
$function$;

-- Explicitly restrict function execution.
-- SECURITY INVOKER ensures that the caller's database
-- permissions and RLS rules remain in effect.

REVOKE ALL ON FUNCTION public.ingest_reservation_request(
    text,
    text,
    text,
    boolean,
    text,
    date,
    time without time zone,
    integer,
    text,
    text,
    text,
    text,
    text
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.ingest_reservation_request(
    text,
    text,
    text,
    boolean,
    text,
    date,
    time without time zone,
    integer,
    text,
    text,
    text,
    text,
    text
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.ingest_reservation_request(
    text,
    text,
    text,
    boolean,
    text,
    date,
    time without time zone,
    integer,
    text,
    text,
    text,
    text,
    text
) TO service_role;

-- Fin & Feathers Las Vegas
-- Reservation Ingestion Behavioral Tests
--
-- IMPORTANT:
-- These statements must be inserted into
-- reservation_ingest_rollback_test.sql
-- immediately BEFORE its final ROLLBACK statement.
--
-- Do not run this file by itself.
-- The ingestion function must first be created
-- inside the same transaction.

-- TEST 1: Create a validated reservation.
-- Expected:
-- resulting_status = pending
-- reservation_created = true
-- notification_created = true

SELECT
    resulting_status,
    reservation_created,
    notification_created,
    notification_event_key
FROM public.ingest_reservation_request(
    p_twilio_execution_sid => 'FN11111111111111111111111111111111',
    p_customer_phone => '+15555550101',
    p_request_status => 'pending',
    p_details_validated => true,
    p_customer_name => 'Test Guest',
    p_reservation_date => DATE '2026-11-20',
    p_reservation_time => TIME '19:00',
    p_party_size => 4,
    p_occasion => 'BIRTHDAY'
);

-- TEST 2: Repeat the same reservation.
-- Expected:
-- resulting_status = pending
-- reservation_created = false
-- notification_created = false

-- TEST 2: Assert duplicate-response flags.
DO $test_duplicate$
DECLARE
    v_result record;
BEGIN
    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid => 'FN11111111111111111111111111111111',
        p_customer_phone => '+15555550101',
        p_request_status => 'pending',
        p_details_validated => true,
        p_customer_name => 'Test Guest',
        p_reservation_date => DATE '2026-11-20',
        p_reservation_time => TIME '19:00',
        p_party_size => 4,
        p_occasion => 'BIRTHDAY'
    );

    IF v_result.resulting_status IS DISTINCT FROM 'pending'
       OR v_result.reservation_created IS DISTINCT FROM false
       OR v_result.notification_created IS DISTINCT FROM false
    THEN
        RAISE EXCEPTION
            'FAIL: Duplicate request returned unexpected flags';
    END IF;

    RAISE NOTICE
        'PASS: Duplicate request returned false/false';
END;
$test_duplicate$;

-- TEST 3: Verify duplicate prevention.
-- Expected:
-- reservation_count = 1
-- notification_count = 1

SELECT
    (
        SELECT COUNT(*)
        FROM public.reservation_requests
        WHERE twilio_execution_sid =
            'FN11111111111111111111111111111111'
    ) AS reservation_count,
    (
        SELECT COUNT(*)
        FROM public.reservation_notification_events
        WHERE event_key =
            'FN11111111111111111111111111111111:new_reservation:NONE'
    ) AS notification_count;

-- TEST 4: Verify the saved reservation.
-- Expected:
-- request_status = pending
-- details_validated = true
-- party_size = 4
-- deposit_amount = NULL
-- deposit_status = not_required

SELECT
    request_status,
    details_validated,
    customer_name,
    party_size,
    deposit_amount,
    deposit_status
FROM public.reservation_requests
WHERE twilio_execution_sid =
    'FN11111111111111111111111111111111';
-- TEST 5: Automatic duplicate-prevention assertions.
DO $test$
DECLARE
    v_reservation_count integer;
    v_notification_count integer;
BEGIN
    SELECT COUNT(*)
    INTO v_reservation_count
    FROM public.reservation_requests
    WHERE twilio_execution_sid =
        'FN11111111111111111111111111111111';

    SELECT COUNT(*)
    INTO v_notification_count
    FROM public.reservation_notification_events
    WHERE event_key =
        'FN11111111111111111111111111111111:new_reservation:NONE';

    IF v_reservation_count <> 1 THEN
        RAISE EXCEPTION
            'FAIL: Expected 1 reservation, found %',
            v_reservation_count;
    END IF;

    IF v_notification_count <> 1 THEN
        RAISE EXCEPTION
            'FAIL: Expected 1 notification, found %',
            v_notification_count;
    END IF;

    RAISE NOTICE
        'PASS: Exactly 1 reservation and 1 notification';
END;
$test$;
-- TEST 6: Verify all deposit tiers.
DO $test_deposits$
DECLARE
    v_guests integer;
    v_expected_amount integer;
    v_actual_amount integer;
    v_actual_status text;
    v_execution_sid text;
BEGIN
    FOR v_guests IN 8..20 LOOP

        v_execution_sid :=
            'FN' || LPAD(v_guests::text, 32, '0');

        PERFORM *
        FROM public.ingest_reservation_request(
            p_twilio_execution_sid => v_execution_sid,
            p_customer_phone => '+15555550101',
            p_request_status => 'pending',
            p_details_validated => true,
            p_customer_name => 'Deposit Test Guest',
            p_reservation_date => DATE '2026-11-20',
            p_reservation_time => TIME '19:00',
            p_party_size => v_guests,
            p_occasion => 'GROUP DINING'
        );

        SELECT
            deposit_amount,
            deposit_status
        INTO
            v_actual_amount,
            v_actual_status
        FROM public.reservation_requests
        WHERE twilio_execution_sid = v_execution_sid;

        v_expected_amount := CASE
            WHEN v_guests <= 8 THEN NULL
            WHEN v_guests <= 10 THEN 55
            WHEN v_guests <= 14 THEN 80
            ELSE 110
        END;

                IF v_actual_amount IS DISTINCT FROM v_expected_amount
           OR (
               v_guests <= 8
               AND v_actual_status IS DISTINCT FROM 'not_required'
           )
           OR (
               v_guests > 8
               AND v_actual_status IS DISTINCT FROM 'pending'
           )
        THEN
            RAISE EXCEPTION
                'FAIL: Incorrect deposit for % guests',
                v_guests;
        END IF;

    END LOOP;

    RAISE NOTICE
        'PASS: Deposit tiers verified for parties of 8 through 20';
END;
$test_deposits$;
-- TEST 7: Customer timeout after validated reservation.
DO $test_timeout$
DECLARE
    v_result record;
    v_status text;
    v_validated boolean;
    v_reason text;
    v_stage text;
    v_event_count integer;
BEGIN
    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid => 'FN11111111111111111111111111111111',
        p_customer_phone => '+15555550101',
        p_request_status => 'incomplete',
        p_details_validated => false,
        p_interruption_reason => 'CUSTOMER TIMEOUT',
        p_interruption_stage => 'VIP FIRST ATTEMPT'
    );

    SELECT
        request_status,
        details_validated,
        interruption_reason,
        interruption_stage
    INTO
        v_status,
        v_validated,
        v_reason,
        v_stage
    FROM public.reservation_requests
    WHERE twilio_execution_sid =
        'FN11111111111111111111111111111111';

    SELECT COUNT(*)
    INTO v_event_count
    FROM public.reservation_notification_events
    WHERE reservation_request_id = v_result.reservation_id;

    IF v_status IS DISTINCT FROM 'incomplete'
       OR v_validated IS DISTINCT FROM true
       OR v_reason IS DISTINCT FROM 'CUSTOMER TIMEOUT'
       OR v_stage IS DISTINCT FROM 'VIP FIRST ATTEMPT'
       OR v_event_count <> 2
       OR v_result.notification_created IS DISTINCT FROM true
    THEN
        RAISE EXCEPTION
            'FAIL: Customer timeout handling';
    END IF;

    RAISE NOTICE
        'PASS: Timeout preserves validated details and creates staff notification';
END;
$test_timeout$;
-- TEST 8: Display final timeout results.
SELECT
    r.request_status,
    r.details_validated,
    r.customer_name,
    r.party_size,
    r.interruption_reason,
    r.interruption_stage,
    (
        SELECT COUNT(*)
        FROM public.reservation_notification_events AS e
        WHERE e.reservation_request_id = r.id
    ) AS notification_count
FROM public.reservation_requests AS r
WHERE r.twilio_execution_sid =
    'FN11111111111111111111111111111111';
-- TEST 9: Message delivery failure on a separate reservation.
DO $test_delivery_failure$
DECLARE
    v_result record;
    v_status text;
    v_reason text;
    v_stage text;
    v_notification_type text;
BEGIN
    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid => 'FN22222222222222222222222222222222',
        p_customer_phone => '+15555550102',
        p_request_status => 'incomplete',
        p_details_validated => false,
        p_interruption_reason => 'MESSAGE DELIVERY FAILURE',
        p_interruption_stage => 'RESERVATION CORRECTION'
    );

    SELECT
        request_status,
        interruption_reason,
        interruption_stage
    INTO
        v_status,
        v_reason,
        v_stage
    FROM public.reservation_requests
    WHERE id = v_result.reservation_id;

    SELECT notification_type
    INTO v_notification_type
    FROM public.reservation_notification_events
    WHERE reservation_request_id = v_result.reservation_id;

    IF v_status IS DISTINCT FROM 'incomplete'
       OR v_reason IS DISTINCT FROM 'MESSAGE DELIVERY FAILURE'
       OR v_stage IS DISTINCT FROM 'RESERVATION CORRECTION'
       OR v_notification_type IS DISTINCT FROM 'unvalidated_reservation'
       OR v_result.notification_created IS DISTINCT FROM true
    THEN
        RAISE EXCEPTION
            'FAIL: Message delivery failure handling';
    END IF;

    RAISE NOTICE
        'PASS: Message delivery failure creates unvalidated staff notification';
END;
$test_delivery_failure$;
-- TEST 10: Display message delivery failure results.
SELECT
    r.request_status,
    r.details_validated,
    r.customer_name,
    r.interruption_reason,
    r.interruption_stage,
    e.notification_type,
    e.notification_status
FROM public.reservation_requests AS r
JOIN public.reservation_notification_events AS e
    ON e.reservation_request_id = r.id
WHERE r.twilio_execution_sid =
    'FN22222222222222222222222222222222';
-- TEST 11: Validated details arrive after an unvalidated interruption.
DO $test_late_validation$
DECLARE
    v_result record;
    v_status text;
    v_validated boolean;
    v_name text;
    v_guests integer;
    v_deposit integer;
    v_notification_count integer;
BEGIN
    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid => 'FN22222222222222222222222222222222',
        p_customer_phone => '+15555550102',
        p_request_status => 'pending',
        p_details_validated => true,
        p_customer_name => 'Late Validation Guest',
        p_reservation_date => DATE '2026-11-20',
        p_reservation_time => TIME '19:00',
        p_party_size => 10,
        p_occasion => 'BIRTHDAY',
        p_email => 'test@example.com',
        p_vip_preference => 'YES'
    );

    SELECT
        request_status,
        details_validated,
        customer_name,
        party_size,
        deposit_amount
    INTO
        v_status,
        v_validated,
        v_name,
        v_guests,
        v_deposit
    FROM public.reservation_requests
    WHERE id = v_result.reservation_id;

    SELECT COUNT(*)
    INTO v_notification_count
    FROM public.reservation_notification_events
    WHERE reservation_request_id = v_result.reservation_id;

    IF v_status IS DISTINCT FROM 'incomplete'
       OR v_validated IS DISTINCT FROM true
       OR v_name IS DISTINCT FROM 'Late Validation Guest'
       OR v_guests IS DISTINCT FROM 10
       OR v_deposit IS DISTINCT FROM 55
       OR v_notification_count <> 2
    THEN
        RAISE EXCEPTION
            'FAIL: Late validation handling';
    END IF;

    RAISE NOTICE
        'PASS: Late validated details saved; reservation remains incomplete';
END;
$test_late_validation$;
-- TEST 12: Display final late-validation results.
SELECT
    r.request_status,
    r.details_validated,
    r.customer_name,
    r.party_size,
    r.deposit_amount,
    r.deposit_status,
    r.interruption_reason,
    (
        SELECT COUNT(*)
        FROM public.reservation_notification_events AS e
        WHERE e.reservation_request_id = r.id
    ) AS notification_count
FROM public.reservation_requests AS r
WHERE r.twilio_execution_sid =
    'FN22222222222222222222222222222222';
-- TEST 13: Inspect notification events after late validation.
SELECT
    r.request_status,
    e.notification_type,
    e.notification_status,
    e.event_key
FROM public.reservation_requests AS r
JOIN public.reservation_notification_events AS e
    ON e.reservation_request_id = r.id
WHERE r.twilio_execution_sid =
    'FN22222222222222222222222222222222'
ORDER BY e.created_at, e.event_key;
-- TEST 14: Verify late validation notification classification.
DO $test_notification_classification$
DECLARE
    v_correct_count integer;
    v_incorrect_count integer;
BEGIN
    SELECT COUNT(*)
    INTO v_correct_count
    FROM public.reservation_notification_events
    WHERE event_key =
        'FN22222222222222222222222222222222:incomplete_reservation:NONE'
      AND notification_type = 'incomplete_reservation';

    SELECT COUNT(*)
    INTO v_incorrect_count
    FROM public.reservation_notification_events
    WHERE event_key =
        'FN22222222222222222222222222222222:new_reservation:NONE';

    IF v_correct_count <> 1 OR v_incorrect_count <> 0 THEN
        RAISE EXCEPTION
            'FAIL: Late validation notification classification';
    END IF;

    RAISE NOTICE
        'PASS: Late validation classified as incomplete_reservation';
END;
$test_notification_classification$;
-- TEST 15: Duplicate late-validation events must be idempotent.
DO $test_duplicate_late_validation$
DECLARE
    v_result record;
    v_event_count integer;
BEGIN
    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid => 'FN22222222222222222222222222222222',
        p_customer_phone => '+15555550102',
        p_request_status => 'pending',
        p_details_validated => true,
        p_customer_name => 'Late Validation Guest',
        p_reservation_date => DATE '2026-11-20',
        p_reservation_time => TIME '19:00',
        p_party_size => 10,
        p_occasion => 'BIRTHDAY',
        p_email => 'test@example.com',
        p_vip_preference => 'YES'
    );

    SELECT COUNT(*)
    INTO v_event_count
    FROM public.reservation_notification_events
    WHERE reservation_request_id = v_result.reservation_id;

    IF v_result.reservation_created IS DISTINCT FROM false
       OR v_result.notification_created IS DISTINCT FROM false
       OR v_result.resulting_status IS DISTINCT FROM 'incomplete'
       OR v_event_count <> 2
    THEN
        RAISE EXCEPTION
            'FAIL: Duplicate late-validation event';
    END IF;

    RAISE NOTICE
        'PASS: Duplicate late-validation event ignored';
END;
$test_duplicate_late_validation$;
-- TEST 16: Reject a mismatched customer phone number.
DO $test_customer_phone_mismatch$
DECLARE
    v_rejected boolean := false;
BEGIN
    BEGIN
        PERFORM public.ingest_reservation_request(
            p_twilio_execution_sid => 'FN22222222222222222222222222222222',
            p_customer_phone => '+15555550999',
            p_request_status => 'pending',
            p_details_validated => true,
            p_customer_name => 'Different Customer',
            p_reservation_date => DATE '2026-11-20',
            p_reservation_time => TIME '19:00',
            p_party_size => 10,
            p_occasion => 'BIRTHDAY'
        );
    EXCEPTION
        WHEN raise_exception THEN
            IF SQLERRM = 'Customer phone mismatch for existing execution' THEN
                v_rejected := true;
            ELSE
                RAISE;
            END IF;
    END;

    IF NOT v_rejected THEN
        RAISE EXCEPTION
            'FAIL: Mismatched customer phone was accepted';
    END IF;

    RAISE NOTICE
        'PASS: Mismatched customer phone rejected';
END;
$test_customer_phone_mismatch$;
-- TEST 17: Staff-confirmed reservations cannot be overwritten.
DO $test_staff_decision$
DECLARE
    v_result record;
    v_status text;
    v_notification_count_before integer;
    v_notification_count_after integer;
BEGIN
    -- Simulate a staff confirmation of the validated test reservation.

    UPDATE public.reservation_requests
    SET request_status = 'confirmed',
        confirmed_at = now()
    WHERE twilio_execution_sid =
        'FN11111111111111111111111111111111';

    SELECT COUNT(*)
    INTO v_notification_count_before
    FROM public.reservation_notification_events AS e
    JOIN public.reservation_requests AS r
        ON r.id = e.reservation_request_id
    WHERE r.twilio_execution_sid =
        'FN11111111111111111111111111111111';

    -- Simulate a delayed chatbot interruption.

    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid =>
            'FN11111111111111111111111111111111',
        p_customer_phone => '+15555550101',
        p_request_status => 'incomplete',
        p_details_validated => false,
        p_interruption_reason => 'MESSAGE DELIVERY FAILURE',
        p_interruption_stage => 'VIP RETRY'
    );

    SELECT request_status
    INTO v_status
    FROM public.reservation_requests
    WHERE twilio_execution_sid =
        'FN11111111111111111111111111111111';

    SELECT COUNT(*)
    INTO v_notification_count_after
    FROM public.reservation_notification_events AS e
    JOIN public.reservation_requests AS r
        ON r.id = e.reservation_request_id
    WHERE r.twilio_execution_sid =
        'FN11111111111111111111111111111111';

    IF v_status IS DISTINCT FROM 'confirmed'
       OR v_result.resulting_status IS DISTINCT FROM 'confirmed'
       OR v_result.reservation_created IS DISTINCT FROM false
       OR v_result.notification_created IS DISTINCT FROM false
       OR v_notification_count_after <> v_notification_count_before
    THEN
        RAISE EXCEPTION
            'FAIL: Staff-confirmed reservation was modified';
    END IF;

    RAISE NOTICE
        'PASS: Staff confirmation protected from delayed chatbot events';
END;
$test_staff_decision$;
-- TEST 18: Closed reservations cannot be reopened by chatbot events.
DO $test_closed_reservation$
DECLARE
    v_result record;
    v_status text;
    v_notification_count_before integer;
    v_notification_count_after integer;
BEGIN
    -- Close the previously confirmed test reservation.

    UPDATE public.reservation_requests
    SET request_status = 'closed',
        closed_at = now()
    WHERE twilio_execution_sid =
        'FN11111111111111111111111111111111';

    SELECT COUNT(*)
    INTO v_notification_count_before
    FROM public.reservation_notification_events AS e
    JOIN public.reservation_requests AS r
        ON r.id = e.reservation_request_id
    WHERE r.twilio_execution_sid =
        'FN11111111111111111111111111111111';

    -- Simulate a delayed chatbot event.

    SELECT *
    INTO v_result
    FROM public.ingest_reservation_request(
        p_twilio_execution_sid =>
            'FN11111111111111111111111111111111',
        p_customer_phone => '+15555550101',
        p_request_status => 'incomplete',
        p_details_validated => false,
        p_interruption_reason => 'CUSTOMER TIMEOUT',
        p_interruption_stage => 'VIP RETRY'
    );

    SELECT request_status
    INTO v_status
    FROM public.reservation_requests
    WHERE twilio_execution_sid =
        'FN11111111111111111111111111111111';

    SELECT COUNT(*)
    INTO v_notification_count_after
    FROM public.reservation_notification_events AS e
    JOIN public.reservation_requests AS r
        ON r.id = e.reservation_request_id
    WHERE r.twilio_execution_sid =
        'FN11111111111111111111111111111111';

    IF v_status IS DISTINCT FROM 'closed'
       OR v_result.resulting_status IS DISTINCT FROM 'closed'
       OR v_result.reservation_created IS DISTINCT FROM false
       OR v_result.notification_created IS DISTINCT FROM false
       OR v_notification_count_after <> v_notification_count_before
    THEN
        RAISE EXCEPTION
            'FAIL: Closed reservation was modified';
    END IF;

    RAISE NOTICE
        'PASS: Closed reservation protected from delayed chatbot events';
END;
$test_closed_reservation$;
ROLLBACK;