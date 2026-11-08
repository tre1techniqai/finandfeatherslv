-- Fin & Feathers Las Vegas
-- Block automation handback during active staff interventions.
-- No changes to existing reservation workflows or SMS dispatch.

BEGIN;

CREATE FUNCTION public.guard_active_staff_intervention_ownership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF OLD.mode = 'staff'
     AND NEW.mode IS DISTINCT FROM 'staff'
  THEN
    IF EXISTS (
      SELECT 1
      FROM public.reservation_staff_interventions si
      WHERE si.reservation_request_id =
            OLD.reservation_request_id
        AND si.conversation_id = OLD.id
        AND si.status IN (
          'draft',
          'awaiting_guest',
          'staff_review'
        )
    ) THEN
      RAISE EXCEPTION
        'Active staff intervention prevents automation handback'
        USING ERRCODE = '55000';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION
  public.guard_active_staff_intervention_ownership()
FROM PUBLIC, anon, authenticated;

CREATE TRIGGER guard_active_staff_intervention_ownership
BEFORE UPDATE OF mode
ON public.reservation_shared_conversations
FOR EACH ROW
EXECUTE FUNCTION
  public.guard_active_staff_intervention_ownership();

COMMIT;
