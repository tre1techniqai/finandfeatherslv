-- Fin & Feathers Las Vegas
-- Manager-only reservation confirmation SMS dispatch tracking.
-- Does not send SMS or modify Twilio ingestion.
-- Apply independently through Supabase SQL Editor.

BEGIN;

ALTER TABLE public.reservation_notification_events
  ADD COLUMN dispatch_token uuid;

CREATE OR REPLACE FUNCTION public.claim_reservation_confirmation(
  p_reservation_id uuid
)
RETURNS TABLE (
  notification_event_id uuid,
  notification_event_key text,
  claim_token uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_event public.reservation_notification_events%ROWTYPE;
  v_token uuid;
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.staff_roles sr
    WHERE sr.user_id = v_user_id
      AND sr.is_active = true
      AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Manager access required'
      USING ERRCODE = '42501';
  END IF;

  SELECT ne.* INTO v_event
  FROM public.reservation_notification_events ne
  JOIN public.reservation_requests rr
    ON rr.id = ne.reservation_request_id
  JOIN public.reservation_staff_workflows sw
    ON sw.reservation_request_id = rr.id
  WHERE rr.id = p_reservation_id
    AND rr.request_status = 'confirmed'
    AND sw.workflow_status = 'confirmed'
    AND ne.notification_type = 'reservation_confirmed'
  FOR UPDATE OF ne;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Confirmed notification not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_event.notification_status <> 'pending'
     OR v_event.twilio_message_sid IS NOT NULL
     OR v_event.dispatch_token IS NOT NULL THEN
    RAISE EXCEPTION 'Notification already claimed or processed'
      USING ERRCODE = '22023';
  END IF;

  v_token := gen_random_uuid();

  UPDATE public.reservation_notification_events ne
  SET notification_status = 'unknown',
      dispatch_token = v_token,
      failure_code = 'DISPATCH_IN_PROGRESS',
      failure_description = NULL,
      updated_at = clock_timestamp()
  WHERE ne.id = v_event.id;

  RETURN QUERY
  SELECT v_event.id, v_event.event_key, v_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.finish_reservation_confirmation(
  p_notification_event_id uuid,
  p_claim_token uuid,
  p_result text,
  p_message_sid text DEFAULT NULL
)
RETURNS TABLE (
  notification_event_id uuid,
  notification_status text,
  twilio_message_sid text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_event public.reservation_notification_events%ROWTYPE;
  v_status text;
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.staff_roles sr
    WHERE sr.user_id = v_user_id
      AND sr.is_active = true
      AND sr.role = 'manager'
  ) THEN
    RAISE EXCEPTION 'Manager access required'
      USING ERRCODE = '42501';
  END IF;

  IF p_claim_token IS NULL THEN
    RAISE EXCEPTION 'Claim token required'
      USING ERRCODE = '22023';
  END IF;

  SELECT ne.* INTO v_event
  FROM public.reservation_notification_events ne
  WHERE ne.id = p_notification_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_event.notification_type <> 'reservation_confirmed'
     OR v_event.notification_status <> 'unknown'
     OR v_event.failure_code <> 'DISPATCH_IN_PROGRESS'
     OR v_event.dispatch_token IS DISTINCT FROM p_claim_token THEN
    RAISE EXCEPTION 'Notification claim is not active'
      USING ERRCODE = '22023';
  END IF;

  IF p_result = 'accepted' THEN
    IF p_message_sid IS NULL
       OR p_message_sid !~ '^SM[0-9a-fA-F]{32}$' THEN
      RAISE EXCEPTION 'Valid Twilio Message SID required'
        USING ERRCODE = '22023';
    END IF;

    v_status := 'sent';

    UPDATE public.reservation_notification_events ne
    SET notification_status = v_status,
        twilio_message_sid = p_message_sid,
        failure_code = NULL,
        failure_description = NULL,
        updated_at = clock_timestamp()
    WHERE ne.id = p_notification_event_id;

  ELSIF p_result = 'uncertain' THEN
    v_status := 'unknown';

    UPDATE public.reservation_notification_events ne
    SET notification_status = v_status,
        failure_code = 'SEND_OUTCOME_UNKNOWN',
        failure_description =
          'Review Twilio message logs before considering another send.',
        updated_at = clock_timestamp()
    WHERE ne.id = p_notification_event_id;

  ELSE
    RAISE EXCEPTION 'Unsupported notification result'
      USING ERRCODE = '22023';
  END IF;

  -- Retain the claim token as a record of the attempt.
  -- A finished or uncertain event cannot be claimed again.

  RETURN QUERY
  SELECT ne.id, ne.notification_status, ne.twilio_message_sid
  FROM public.reservation_notification_events ne
  WHERE ne.id = p_notification_event_id;
END;
$function$;

REVOKE ALL ON FUNCTION
  public.claim_reservation_confirmation(uuid)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
  public.claim_reservation_confirmation(uuid)
  TO authenticated;

REVOKE ALL ON FUNCTION
  public.finish_reservation_confirmation(uuid,uuid,text,text)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
  public.finish_reservation_confirmation(uuid,uuid,text,text)
  TO authenticated;

COMMIT;