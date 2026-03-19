
ALTER TABLE public.employees DROP CONSTRAINT employees_role_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_role_check CHECK (role = ANY (ARRAY['crew', 'supervisor', 'manager', 'admin', 'owner']));
