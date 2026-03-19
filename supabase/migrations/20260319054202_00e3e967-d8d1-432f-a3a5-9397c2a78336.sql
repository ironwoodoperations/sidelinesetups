
-- Add SMS opt-in preference to profiles
ALTER TABLE public.profiles ADD COLUMN sms_opt_in boolean DEFAULT true;

-- Update the booking status trigger to respect SMS opt-in
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
  _profile RECORD;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.phone IS NULL OR NEW.phone = '' THEN
    RETURN NEW;
  END IF;

  -- Check if user has opted out of SMS
  IF NEW.user_id IS NOT NULL THEN
    SELECT * INTO _profile FROM public.profiles WHERE id = NEW.user_id LIMIT 1;
    IF _profile IS NOT NULL AND _profile.sms_opt_in = false THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Also check the sms_consent_given field on the booking itself
  IF NEW.sms_consent_given = false THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _rule FROM public.sms_auto_rules
    WHERE status_trigger = NEW.status AND is_active = true
    LIMIT 1;

  IF _rule IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _template FROM public.sms_templates
    WHERE id = _rule.template_id AND is_active = true
    LIMIT 1;

  IF _template IS NULL THEN
    RETURN NEW;
  END IF;

  _message := _template.body;
  _message := replace(_message, '{{name}}', COALESCE(NEW.full_name, ''));
  _message := replace(_message, '{{team}}', COALESCE(NEW.team_name, ''));
  _message := replace(_message, '{{phone}}', COALESCE(NEW.phone, ''));
  _message := replace(_message, '{{email}}', COALESCE(NEW.contact_email, ''));
  _message := replace(_message, '{{date}}', COALESCE(NEW.date::text, ''));
  _message := replace(_message, '{{event}}', COALESCE(NEW.event_type, ''));
  _message := replace(_message, '{{park}}', '');

  INSERT INTO public.sms_logs (phone, message, booking_id, sent_by, status)
  VALUES (NEW.phone, _message, NEW.id, 'auto', 'queued');

  RETURN NEW;
END;
$$;
