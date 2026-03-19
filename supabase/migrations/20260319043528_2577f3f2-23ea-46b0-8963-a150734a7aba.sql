
-- Allow public INSERT/UPDATE/DELETE on admin-managed tables
-- Events
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON public.events FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete events" ON public.events FOR DELETE TO public USING (true);

-- Packages
CREATE POLICY "Anyone can insert packages" ON public.packages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update packages" ON public.packages FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete packages" ON public.packages FOR DELETE TO public USING (true);

-- Equipment
CREATE POLICY "Anyone can insert equipment" ON public.equipment FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update equipment" ON public.equipment FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete equipment" ON public.equipment FOR DELETE TO public USING (true);

-- Add-ons
CREATE POLICY "Anyone can insert add_ons" ON public.add_ons FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update add_ons" ON public.add_ons FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete add_ons" ON public.add_ons FOR DELETE TO public USING (true);

-- Discount codes
CREATE POLICY "Anyone can insert discount_codes" ON public.discount_codes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update discount_codes" ON public.discount_codes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete discount_codes" ON public.discount_codes FOR DELETE TO public USING (true);

-- FAQ items
CREATE POLICY "Anyone can insert faq_items" ON public.faq_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update faq_items" ON public.faq_items FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete faq_items" ON public.faq_items FOR DELETE TO public USING (true);

-- Site settings
CREATE POLICY "Anyone can insert site_settings" ON public.site_settings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update site_settings" ON public.site_settings FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Parks
CREATE POLICY "Anyone can insert parks" ON public.parks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update parks" ON public.parks FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete parks" ON public.parks FOR DELETE TO public USING (true);

-- Fields
CREATE POLICY "Anyone can insert fields" ON public.fields FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update fields" ON public.fields FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete fields" ON public.fields FOR DELETE TO public USING (true);

-- Spots
CREATE POLICY "Anyone can insert spots" ON public.spots FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update spots" ON public.spots FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete spots" ON public.spots FOR DELETE TO public USING (true);

-- Bookings (add update)
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are publicly readable" ON public.employees FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert employees" ON public.employees FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update employees" ON public.employees FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete employees" ON public.employees FOR DELETE TO public USING (true);
