ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS square_app_id text,
  ADD COLUMN IF NOT EXISTS square_location_id text,
  ADD COLUMN IF NOT EXISTS square_environment text DEFAULT 'sandbox';

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS square_payment_id text;