
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
