
-- Table mapping booking statuses to SMS templates
CREATE TABLE public.sms_auto_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status_trigger text NOT NULL,
  template_id uuid REFERENCES public.sms_templates(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(status_trigger)
);

ALTER TABLE public.sms_auto_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auto rules are publicly readable" ON public.sms_auto_rules FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert sms_auto_rules" ON public.sms_auto_rules FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update sms_auto_rules" ON public.sms_auto_rules FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete sms_auto_rules" ON public.sms_auto_rules FOR DELETE TO public USING (true);
