
-- Add loyalty_points to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
