
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PARKS
CREATE TABLE public.parks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  park_type text DEFAULT 'tournament',
  street_address text,
  city text,
  state text,
  zip text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parks are publicly readable" ON public.parks FOR SELECT USING (true);

-- FIELDS
CREATE TABLE public.fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id uuid REFERENCES public.parks(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  max_league_spots integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fields are publicly readable" ON public.fields FOR SELECT USING (true);

-- SPOTS
CREATE TABLE public.spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES public.fields(id) ON DELETE CASCADE,
  label text NOT NULL,
  x numeric(5,2) DEFAULT 50,
  y numeric(5,2) DEFAULT 50,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spots are publicly readable" ON public.spots FOR SELECT USING (true);

-- EQUIPMENT
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('tent','chair','cooler','sidewall','fan','lighting','audio','misc')),
  total_qty integer DEFAULT 0,
  available_qty integer DEFAULT 0,
  rented_qty integer DEFAULT 0,
  maintenance_qty integer DEFAULT 0,
  damaged_qty integer DEFAULT 0,
  cogs_per_use_usd numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment is publicly readable" ON public.equipment FOR SELECT USING (true);

-- PACKAGES
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  per_game_usd numeric(10,2),
  per_day_usd numeric(10,2),
  full_weekend_usd numeric(10,2),
  base_items jsonb DEFAULT '[]',
  add_on_ids jsonb DEFAULT '[]',
  features jsonb DEFAULT '[]',
  show_for_tournament boolean DEFAULT true,
  show_for_league boolean DEFAULT true,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages are publicly readable" ON public.packages FOR SELECT USING (true);

-- ADD-ONS
CREATE TABLE public.add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  equipment_id uuid REFERENCES public.equipment(id),
  per_game_usd numeric(10,2),
  per_day_usd numeric(10,2),
  full_weekend_usd numeric(10,2),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Add-ons are publicly readable" ON public.add_ons FOR SELECT USING (true);

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  event_type text CHECK (event_type IN ('tournament','league')),
  sport text CHECK (sport IN ('softball','baseball','soccer')),
  start_date date,
  end_date date,
  park_ids jsonb DEFAULT '[]',
  field_ids jsonb DEFAULT '[]',
  package_ids jsonb DEFAULT '[]',
  league_enabled boolean DEFAULT false,
  league_dates jsonb DEFAULT '[]',
  league_start_time text,
  league_end_time text,
  league_buffer_minutes integer DEFAULT 90,
  is_active boolean DEFAULT true,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT USING (true);

-- DISCOUNT CODES
CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric(10,2) NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discount codes are publicly readable" ON public.discount_codes FOR SELECT USING (true);

-- EMPLOYEES
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  pin text NOT NULL,
  role text DEFAULT 'crew' CHECK (role IN ('crew','supervisor','manager')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  contact_email text,
  phone text,
  team_name text,
  coach_name text,
  event_id uuid REFERENCES public.events(id),
  event_type text CHECK (event_type IN ('tournament','league')),
  sport text CHECK (sport IN ('softball','baseball','soccer')),
  date date,
  game_times jsonb DEFAULT '[]',
  park_id uuid REFERENCES public.parks(id),
  field_id uuid REFERENCES public.fields(id),
  spot_id uuid REFERENCES public.spots(id),
  package_id uuid REFERENCES public.packages(id),
  package_mode text CHECK (package_mode IN ('per_game','day','weekend','hourly')),
  add_ons jsonb DEFAULT '[]',
  line_items_json jsonb DEFAULT '[]',
  base_cents integer DEFAULT 0,
  add_on_cents integer DEFAULT 0,
  total_cents integer DEFAULT 0,
  discount_code_id uuid REFERENCES public.discount_codes(id),
  discount_amount_cents integer DEFAULT 0,
  loyalty_points_earned integer DEFAULT 0,
  loyalty_points_redeemed integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','photo_uploaded','setup','checked_in','leaving','picked_up','closed','cancelled')),
  agreed_to_terms boolean DEFAULT false,
  sms_consent_given boolean DEFAULT false,
  id_photo_url text,
  id_verified_by text,
  id_skip_approved_by text,
  needs_id_review boolean DEFAULT false,
  equipment_setup_checklist jsonb DEFAULT '{}',
  paypal_order_id text,
  xero_invoice_id text,
  notes text,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings are publicly readable" ON public.bookings FOR SELECT USING (true);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LOCKS (prevent double-booking)
CREATE TABLE public.locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES public.spots(id),
  field_id uuid REFERENCES public.fields(id),
  date date,
  status text DEFAULT 'active',
  expires_at timestamptz,
  booking_id uuid REFERENCES public.bookings(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locks are publicly readable" ON public.locks FOR SELECT USING (true);
CREATE POLICY "Anyone can create a lock" ON public.locks FOR INSERT WITH CHECK (true);

-- SITE SETTINGS
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text DEFAULT 'Sideline Setups',
  support_email text,
  hero_softball_url text,
  hero_baseball_url text,
  hero_soccer_url text,
  default_sport text DEFAULT 'softball',
  paypal_client_id text,
  paypal_mode text DEFAULT 'sandbox',
  service_fee_cents integer DEFAULT 0,
  tax_rate_percent numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);

-- FAQ ITEMS
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ items are publicly readable" ON public.faq_items FOR SELECT USING (true);

-- STORAGE: ID photos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('id-photos', 'id-photos', false);
