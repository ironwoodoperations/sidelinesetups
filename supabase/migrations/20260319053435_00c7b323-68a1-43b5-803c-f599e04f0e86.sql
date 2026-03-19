
CREATE TABLE public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'general',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SMS templates are publicly readable" ON public.sms_templates FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert sms_templates" ON public.sms_templates FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update sms_templates" ON public.sms_templates FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete sms_templates" ON public.sms_templates FOR DELETE TO public USING (true);
