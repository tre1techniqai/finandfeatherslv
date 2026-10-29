-- FIN & FEATHERS LAS VEGAS
-- STEP 58D.15.47
--
-- SHARED SMS AUTHORIZATION AND MODE TRANSITIONS
--
-- DEPLOYMENT CANDIDATE - CONTROLLED SHARED SMS ROLLOUT
--
-- Uses existing tables and constraints.
-- No new tables, columns, indexes, or RLS policies.
-- No Twilio calls.
-- No legacy ownership mutations.
-- No SMS sending.
--
-- Architecture:
--
-- automation
--   -> transitioning_to_staff
--   -> staff
--   -> automation
--
-- Failed activation:
--
-- transitioning_to_staff
--   -> automation
--
-- SMS operation lifecycle:
--
-- registered -> submitting -> accepted
--                          -> rejected
--                          -> uncertain
--
-- registered -> cancelled
--
-- "uncertain" is never automatically retried.
--
-- All mode-changing functions are service_role only.
-- Manager identity must be checked by the API.
--
-- Every security-definer function uses a fixed search_path.
--
-- IMPORTANT:
-- Database locks do not lock Twilio Studio executions.
-- Application-level routing fences and fresh Studio
-- checks remain mandatory before mode transitions.

BEGIN;


-- ============================================================
-- 1. REGISTER SHARED SMS
-- ============================================================
--
-- An authenticated active manager registers a message
-- in an existing staff-mode conversation.
--
-- This does not send an SMS.
--
-- Concurrent registration requests with the same
-- client_request_id are serialized through the existing
-- conversation lock and unique constraint.
--
-- A repeated ID is accepted only when sender, conversation,
-- reservation, and message body match.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.register_reservation_shared_sms(
  p_conversation_id uuid,
  p_reservation_id uuid,
  p_client_request_id uuid,
  p_message_body text
)
RETURNS TABLE (
  operation_id uuid,
  operation_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_actor uuid := auth.uid();
  v_conv public.reservation_shared_conversations%ROWTYPE;
  v_op public.reservation_shared_sms_operations%ROWTYPE;
  v_body text := pg_catalog.btrim(p_message_body);
BEGIN

  IF auth.role() IS DISTINCT FROM 'authenticated'
     OR v_actor IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM public.staff_roles s
       WHERE s.user_id = v_actor
         AND s.is_active IS TRUE
         AND s.role = 'manager'
     )
  THEN
    RAISE EXCEPTION 'Active manager required'
      USING ERRCODE = '42501';
  END IF;

  IF p_conversation_id IS NULL
     OR p_reservation_id IS NULL
     OR p_client_request_id IS NULL
     OR v_body IS NULL
     OR pg_catalog.char_length(v_body) NOT BETWEEN 1 AND 1600
     OR v_body ~ '[\x00-\x08\x0B\x0C\x0E-\x1F]'
  THEN
    RAISE EXCEPTION 'Invalid SMS request'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_conv
  FROM public.reservation_shared_conversations c
  WHERE c.id = p_conversation_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_conv.mode <> 'staff'
     OR v_conv.reservation_request_id <> p_reservation_id
  THEN
    RAISE EXCEPTION 'Verified staff conversation required'
      USING ERRCODE = '55000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.reservation_requests r
    WHERE r.id = p_reservation_id
      AND r.customer_phone = v_conv.guest_phone
  )
  THEN
    RAISE EXCEPTION 'Reservation association invalid'
      USING ERRCODE = '55000';
  END IF;

  -- Serializes concurrent registrations in this conversation.

  SELECT *
  INTO v_op
  FROM public.reservation_shared_sms_operations o
  WHERE o.client_request_id = p_client_request_id
  FOR UPDATE;

  IF NOT FOUND THEN

    INSERT INTO public.reservation_shared_sms_operations (
      conversation_id,
      reservation_request_id,
      manager_id,
      client_request_id,
      message_body
    )
    VALUES (
      p_conversation_id,
      p_reservation_id,
      v_actor,
      p_client_request_id,
      v_body
    )
    ON CONFLICT ON CONSTRAINT
      reservation_shared_sms_operations_client_request_id_key
    DO NOTHING
    RETURNING *
    INTO v_op;

    -- Recover the existing operation if another transaction
    -- won the unique-key race.

    IF v_op.id IS NULL THEN
      SELECT *
      INTO v_op
      FROM public.reservation_shared_sms_operations o
      WHERE o.client_request_id = p_client_request_id
      FOR UPDATE;
    END IF;

  END IF;

  IF v_op.id IS NULL THEN
    RAISE EXCEPTION 'Unable to register SMS operation'
      USING ERRCODE = '55000';
  END IF;

  IF v_op.conversation_id <> p_conversation_id
     OR v_op.reservation_request_id <> p_reservation_id
     OR v_op.manager_id <> v_actor
     OR v_op.message_body <> v_body
  THEN
    RAISE EXCEPTION
      'Request ID reused with different content or sender'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT v_op.id, v_op.status;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.register_reservation_shared_sms(
  uuid, uuid, uuid, text
)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.register_reservation_shared_sms(
  uuid, uuid, uuid, text
)
TO authenticated;


-- ============================================================
-- 2. BEGIN SMS SUBMISSION
-- ============================================================
--
-- Trusted server only.
--
-- Changes registered -> submitting.
--
-- The server may submit to Twilio only after this function
-- commits successfully.
--
-- A submitting operation must not be automatically retried
-- following an unknown provider outcome.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.begin_reservation_shared_sms_submission(
  p_operation_id uuid
)
RETURNS TABLE (
  operation_id uuid,
  message_body text,
  guest_phone text,
  restaurant_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv_id uuid;
  v_conv public.reservation_shared_conversations%ROWTYPE;
  v_op public.reservation_shared_sms_operations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  IF p_operation_id IS NULL THEN
    RAISE EXCEPTION 'Operation ID required'
      USING ERRCODE = '22023';
  END IF;

  SELECT o.conversation_id
  INTO v_conv_id
  FROM public.reservation_shared_sms_operations o
  WHERE o.id = p_operation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Operation not found'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT *
  INTO v_conv
  FROM public.reservation_shared_conversations c
  WHERE c.id = v_conv_id
  FOR UPDATE;

  IF NOT FOUND OR v_conv.mode <> 'staff' THEN
    RAISE EXCEPTION 'Staff conversation inactive'
      USING ERRCODE = '55000';
  END IF;

  SELECT *
  INTO v_op
  FROM public.reservation_shared_sms_operations o
  WHERE o.id = p_operation_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_op.status <> 'registered'
     OR v_op.reservation_request_id <>
        v_conv.reservation_request_id
  THEN
    RAISE EXCEPTION 'SMS operation is not eligible'
      USING ERRCODE = '55000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.staff_roles s
    WHERE s.user_id = v_op.manager_id
      AND s.is_active IS TRUE
      AND s.role = 'manager'
  )
  THEN
    RAISE EXCEPTION 'Manager is no longer active'
      USING ERRCODE = '55000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.reservation_requests r
    WHERE r.id = v_op.reservation_request_id
      AND r.customer_phone = v_conv.guest_phone
  )
  THEN
    RAISE EXCEPTION 'Reservation association changed'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reservation_shared_sms_operations other
    WHERE other.conversation_id = v_conv.id
      AND other.id <> v_op.id
      AND other.status IN (
        'submitting',
        'uncertain'
      )
  )
  THEN
    RAISE EXCEPTION
      'Unresolved SMS submission requires reconciliation'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_sms_operations o
  SET
    status = 'submitting',
    started_at = now(),
    updated_at = now()
  WHERE o.id = v_op.id;

  RETURN QUERY
  SELECT
    v_op.id,
    v_op.message_body,
    v_conv.guest_phone,
    v_conv.restaurant_phone;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.begin_reservation_shared_sms_submission(uuid)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.begin_reservation_shared_sms_submission(uuid)
TO service_role;


-- ============================================================
-- 3. FINALIZE SMS SUBMISSION
-- ============================================================
--
-- Trusted server only.
--
-- submitting -> accepted
-- submitting -> rejected
-- submitting -> uncertain
--
-- Only definitive Twilio acceptance can be recorded as
-- accepted with a valid Twilio message SID.
--
-- Unknown outcomes remain uncertain and require
-- explicit subsequent reconciliation.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.finalize_reservation_shared_sms(
  p_operation_id uuid,
  p_status text,
  p_twilio_message_sid text DEFAULT NULL,
  p_outcome_note text DEFAULT NULL
)
RETURNS TABLE (
  operation_id uuid,
  operation_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv_id uuid;
  v_op public.reservation_shared_sms_operations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  IF p_operation_id IS NULL
     OR p_status IS NULL
     OR p_status NOT IN (
       'accepted',
       'rejected',
       'uncertain'
     )
  THEN
    RAISE EXCEPTION 'Invalid finalization result'
      USING ERRCODE = '22023';
  END IF;

  IF (
    p_status = 'accepted'
    AND (
      p_twilio_message_sid IS NULL
      OR p_twilio_message_sid !~ '^SM[0-9a-fA-F]{32}$'
    )
  ) OR (
    p_status <> 'accepted'
    AND p_twilio_message_sid IS NOT NULL
  )
  THEN
    RAISE EXCEPTION 'Invalid Twilio message SID'
      USING ERRCODE = '22023';
  END IF;

  SELECT o.conversation_id
  INTO v_conv_id
  FROM public.reservation_shared_sms_operations o
  WHERE o.id = p_operation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Operation not found'
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1
  FROM public.reservation_shared_conversations c
  WHERE c.id = v_conv_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT *
  INTO v_op
  FROM public.reservation_shared_sms_operations o
  WHERE o.id = p_operation_id
  FOR UPDATE;

  IF NOT FOUND OR v_op.status <> 'submitting' THEN
    RAISE EXCEPTION 'Operation is not awaiting finalization'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_sms_operations o
  SET
    status = p_status,
    twilio_message_sid = p_twilio_message_sid,
    outcome_note = p_outcome_note,
    completed_at = CASE
      WHEN p_status IN ('accepted', 'rejected')
        THEN now()
      ELSE NULL
    END,
    updated_at = now()
  WHERE o.id = p_operation_id;

  IF p_status = 'accepted' THEN
    UPDATE public.reservation_shared_conversations c
    SET
      last_activity_at =
        GREATEST(c.last_activity_at, now()),
      updated_at = now()
    WHERE c.id = v_conv_id;
  END IF;

  RETURN QUERY
  SELECT v_op.id, p_status;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.finalize_reservation_shared_sms(uuid, text, text, text)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.finalize_reservation_shared_sms(uuid, text, text, text)
TO service_role;


-- ============================================================
-- 4. CANCEL UNSENT SMS OPERATION
-- ============================================================
--
-- Trusted server only.
--
-- registered -> cancelled
--
-- Cannot cancel submitting, accepted, rejected,
-- uncertain, or previously cancelled operations.
--
-- This must never be used as a substitute for
-- reconciling an uncertain Twilio submission.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.cancel_reservation_shared_sms_registration(
  p_operation_id uuid
)
RETURNS TABLE (
  operation_id uuid,
  operation_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv_id uuid;
  v_op public.reservation_shared_sms_operations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  IF p_operation_id IS NULL THEN
    RAISE EXCEPTION 'Operation ID required'
      USING ERRCODE = '22023';
  END IF;

  SELECT o.conversation_id
  INTO v_conv_id
  FROM public.reservation_shared_sms_operations o
  WHERE o.id = p_operation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Operation not found'
      USING ERRCODE = 'P0002';
  END IF;

  -- Lock conversation first, matching the submission order.

  PERFORM 1
  FROM public.reservation_shared_conversations c
  WHERE c.id = v_conv_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT *
  INTO v_op
  FROM public.reservation_shared_sms_operations o
  WHERE o.id = p_operation_id
  FOR UPDATE;

  IF NOT FOUND OR v_op.status <> 'registered' THEN
    RAISE EXCEPTION 'Only unsent registrations can be cancelled'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_sms_operations o
  SET
    status = 'cancelled',
    completed_at = now(),
    outcome_note = 'Cancelled before submission',
    updated_at = now()
  WHERE o.id = p_operation_id;

  RETURN QUERY
  SELECT v_op.id, 'cancelled'::text;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.cancel_reservation_shared_sms_registration(uuid)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.cancel_reservation_shared_sms_registration(uuid)
TO service_role;


-- ============================================================
-- 5. REQUEST SHARED STAFF MODE
-- ============================================================
--
-- Trusted server only.
--
-- automation -> transitioning_to_staff
--
-- Manager authorization, router deployment,
-- Studio verification, and feature-flag checks
-- must be completed by the API before calling.
--
-- The function independently checks:
--
-- - Conversation state and expected version
-- - Reservation association
-- - Phone-pair ambiguity
-- - Legacy ownership conflict
-- - Unresolved SMS operations
--
-- It does not call Twilio.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.request_reservation_shared_staff_mode(
  p_conversation_id uuid,
  p_expected_mode_version bigint
)
RETURNS TABLE (
  conversation_id uuid,
  conversation_mode text,
  mode_version bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv public.reservation_shared_conversations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  IF p_conversation_id IS NULL
     OR p_expected_mode_version IS NULL
     OR p_expected_mode_version < 1
  THEN
    RAISE EXCEPTION 'Invalid transition request'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_conv
  FROM public.reservation_shared_conversations c
  WHERE c.id = p_conversation_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_conv.mode <> 'automation'
     OR v_conv.mode_version <> p_expected_mode_version
  THEN
    RAISE EXCEPTION 'Staff transition preconditions changed'
      USING ERRCODE = '55000';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM public.reservation_requests r
    WHERE r.id = v_conv.reservation_request_id
      AND r.customer_phone = v_conv.guest_phone
  ) <> 1 THEN
    RAISE EXCEPTION 'Reservation association invalid'
      USING ERRCODE = '55000';
  END IF;

  -- Strict ambiguity policy:
  -- Only one reservation may match this guest phone
  -- for the initial shared SMS rollout.

  IF (
    SELECT COUNT(*)
    FROM public.reservation_requests r
    WHERE r.customer_phone = v_conv.guest_phone
  ) <> 1 THEN
    RAISE EXCEPTION 'Guest phone matches multiple reservations'
      USING ERRCODE = '55000';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM public.reservation_shared_conversations c
    WHERE c.guest_phone = v_conv.guest_phone
      AND c.restaurant_phone = v_conv.restaurant_phone
  ) <> 1 THEN
    RAISE EXCEPTION 'Shared conversation phone pair ambiguous'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reservation_conversation_ownership o
    WHERE o.guest_phone = v_conv.guest_phone
      AND o.restaurant_phone = v_conv.restaurant_phone
      AND (
        o.reservation_request_id <>
          v_conv.reservation_request_id
        OR o.ownership_status NOT IN (
          'automation',
          'released'
        )
      )
  ) THEN
    RAISE EXCEPTION 'Conflicting legacy ownership'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reservation_shared_sms_operations o
    WHERE o.conversation_id = v_conv.id
      AND o.status IN (
        'registered',
        'submitting',
        'uncertain'
      )
  ) THEN
    RAISE EXCEPTION 'Unresolved SMS operations'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_conversations c
  SET
    mode = 'transitioning_to_staff',
    mode_version = c.mode_version + 1,
    updated_at = now()
  WHERE c.id = v_conv.id
  RETURNING *
  INTO v_conv;

  RETURN QUERY
  SELECT
    v_conv.id,
    v_conv.mode,
    v_conv.mode_version;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.request_reservation_shared_staff_mode(uuid, bigint)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.request_reservation_shared_staff_mode(uuid, bigint)
TO service_role;


-- ============================================================
-- 6. COMPLETE SHARED STAFF MODE
-- ============================================================
--
-- Trusted server only.
--
-- transitioning_to_staff -> staff
--
-- The API must perform a fresh Studio verification
-- and ensure the routing fence is operational.
--
-- A mode_version mismatch rejects stale completion.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.complete_reservation_shared_staff_mode(
  p_conversation_id uuid,
  p_expected_mode_version bigint
)
RETURNS TABLE (
  conversation_id uuid,
  conversation_mode text,
  mode_version bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv public.reservation_shared_conversations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO v_conv
  FROM public.reservation_shared_conversations c
  WHERE c.id = p_conversation_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_conv.mode <> 'transitioning_to_staff'
     OR v_conv.mode_version <> p_expected_mode_version
  THEN
    RAISE EXCEPTION 'Activation preconditions changed'
      USING ERRCODE = '55000';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM public.reservation_requests r
    WHERE r.id = v_conv.reservation_request_id
      AND r.customer_phone = v_conv.guest_phone
  ) <> 1 THEN
    RAISE EXCEPTION 'Reservation association invalid'
      USING ERRCODE = '55000';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM public.reservation_requests r
    WHERE r.customer_phone = v_conv.guest_phone
  ) <> 1 THEN
    RAISE EXCEPTION 'Guest phone matches multiple reservations'
      USING ERRCODE = '55000';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM public.reservation_shared_conversations c
    WHERE c.guest_phone = v_conv.guest_phone
      AND c.restaurant_phone = v_conv.restaurant_phone
  ) <> 1 THEN
    RAISE EXCEPTION 'Shared conversation phone pair ambiguous'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reservation_conversation_ownership o
    WHERE o.guest_phone = v_conv.guest_phone
      AND o.restaurant_phone = v_conv.restaurant_phone
      AND (
        o.reservation_request_id <>
          v_conv.reservation_request_id
        OR o.ownership_status NOT IN (
          'automation',
          'released'
        )
      )
  ) THEN
    RAISE EXCEPTION 'Conflicting legacy ownership'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_conversations c
  SET
    mode = 'staff',
    mode_version = c.mode_version + 1,
    staff_activated_at = now(),
    updated_at = now()
  WHERE c.id = v_conv.id
  RETURNING *
  INTO v_conv;

  RETURN QUERY
  SELECT
    v_conv.id,
    v_conv.mode,
    v_conv.mode_version;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.complete_reservation_shared_staff_mode(uuid, bigint)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.complete_reservation_shared_staff_mode(uuid, bigint)
TO service_role;


-- ============================================================
-- 7. CANCEL INCOMPLETE STAFF TRANSITION
-- ============================================================
--
-- Trusted server only.
--
-- transitioning_to_staff -> automation
--
-- Intended for a failed or abandoned activation.
--
-- The API must verify that restoring automation
-- cannot conflict with an active Studio transition.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.cancel_reservation_shared_staff_transition(
  p_conversation_id uuid,
  p_expected_mode_version bigint
)
RETURNS TABLE (
  conversation_id uuid,
  conversation_mode text,
  mode_version bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv public.reservation_shared_conversations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO v_conv
  FROM public.reservation_shared_conversations c
  WHERE c.id = p_conversation_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_conv.mode <> 'transitioning_to_staff'
     OR v_conv.mode_version <> p_expected_mode_version
  THEN
    RAISE EXCEPTION 'Cancellation preconditions changed'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reservation_shared_sms_operations o
    WHERE o.conversation_id = v_conv.id
      AND o.status IN (
        'registered',
        'submitting',
        'uncertain'
      )
  ) THEN
    RAISE EXCEPTION 'Unresolved SMS operations prevent cancellation'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_conversations c
  SET
    mode = 'automation',
    mode_version = c.mode_version + 1,
    updated_at = now()
  WHERE c.id = v_conv.id
  RETURNING *
  INTO v_conv;

  RETURN QUERY
  SELECT
    v_conv.id,
    v_conv.mode,
    v_conv.mode_version;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.cancel_reservation_shared_staff_transition(uuid, bigint)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.cancel_reservation_shared_staff_transition(uuid, bigint)
TO service_role;


-- ============================================================
-- 8. RESUME AUTOMATION
-- ============================================================
--
-- Trusted server only.
--
-- staff -> automation
--
-- The API must first verify:
-- - Active manager authorization
-- - Valid reservation association
-- - Studio safety
-- - Routing readiness
-- - Expected mode version
--
-- No unresolved SMS operations may remain.
-- ============================================================

CREATE OR REPLACE FUNCTION
public.resume_reservation_shared_automation(
  p_conversation_id uuid,
  p_expected_mode_version bigint
)
RETURNS TABLE (
  conversation_id uuid,
  conversation_mode text,
  mode_version bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_conv public.reservation_shared_conversations%ROWTYPE;
BEGIN

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Trusted service required'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO v_conv
  FROM public.reservation_shared_conversations c
  WHERE c.id = p_conversation_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_conv.mode <> 'staff'
     OR v_conv.mode_version <> p_expected_mode_version
  THEN
    RAISE EXCEPTION 'Resume preconditions changed'
      USING ERRCODE = '55000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.reservation_requests r
    WHERE r.id = v_conv.reservation_request_id
      AND r.customer_phone = v_conv.guest_phone
  ) THEN
    RAISE EXCEPTION 'Reservation association invalid'
      USING ERRCODE = '55000';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reservation_shared_sms_operations o
    WHERE o.conversation_id = v_conv.id
      AND o.status IN (
        'registered',
        'submitting',
        'uncertain'
      )
  ) THEN
    RAISE EXCEPTION 'Unresolved SMS operations prevent resume'
      USING ERRCODE = '55000';
  END IF;

  UPDATE public.reservation_shared_conversations c
  SET
    mode = 'automation',
    mode_version = c.mode_version + 1,
    updated_at = now()
  WHERE c.id = v_conv.id
  RETURNING *
  INTO v_conv;

  RETURN QUERY
  SELECT
    v_conv.id,
    v_conv.mode,
    v_conv.mode_version;

END;
$fn$;

REVOKE ALL ON FUNCTION
public.resume_reservation_shared_automation(uuid, bigint)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
public.resume_reservation_shared_automation(uuid, bigint)
TO service_role;


COMMIT;
