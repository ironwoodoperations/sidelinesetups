
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that fires on booking status change, calls edge function
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rule RECORD;
  _template RECORD;
  _message TEXT;
  _phone TEXT;
  _supabase_url TEXT;
  _anon_key TEXT;
BEGIN
  -- Only fire when status actually changed
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Skip if no phone
  IF NEW.phone IS NULL OR NEW.phone = '' THEN
    RETURN NEW;
  END IF;

  -- Look up active auto rule for this status
  SELECT * INTO _rule FROM public.sms_auto_rules
    WHERE status_trigger = NEW.status AND is_active = true
    LIMIT 1;

  IF _rule IS NULL THEN
    RETURN NEW;
  END IF;

  -- Look up template
  SELECT * INTO _template FROM public.sms_templates
    WHERE id = _rule.template_id AND is_active = true
    LIMIT 1;

  IF _template IS NULL THEN
    RETURN NEW;
  END IF;

  -- Build message with variable substitution
  _message := _template.body;
  _message := replace(_message, '{{name}}', COALESCE(NEW.full_name, ''));
  _message := replace(_message, '{{team}}', COALESCE(NEW.team_name, ''));
  _message := replace(_message, '{{phone}}', COALESCE(NEW.phone, ''));
  _message := replace(_message, '{{email}}', COALESCE(NEW.contact_email, ''));
  _message := replace(_message, '{{date}}', COALESCE(NEW.date::text, ''));

  -- For event/park names we'd need joins, use booking fields
  _message := replace(_message, '{{event}}', COALESCE(NEW.event_type, ''));
  _message := replace(_message, '{{park}}', '');

  _phone := NEW.phone;

  -- Insert into sms_logs and let the edge function pick it up
  INSERT INTO public.sms_logs (phone, message, booking_id, sent_by, status)
  VALUES (_phone, _message, NEW.id, 'auto', 'queued');

  RETURN NEW;
END;
$$;

-- Attach trigger to bookings table
CREATE TRIGGER trg_booking_status_sms
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_status_change();
