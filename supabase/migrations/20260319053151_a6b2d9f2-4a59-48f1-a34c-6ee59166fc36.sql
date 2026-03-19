
CREATE TABLE public.sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  phone text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_response jsonb,
  created_at timestamptz DEFAULT now(),
  sent_by text
);

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SMS logs are publicly readable" ON public.sms_logs FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert sms_logs" ON public.sms_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update sms_logs" ON public.sms_logs FOR UPDATE TO public USING (true) WITH CHECK (true);
