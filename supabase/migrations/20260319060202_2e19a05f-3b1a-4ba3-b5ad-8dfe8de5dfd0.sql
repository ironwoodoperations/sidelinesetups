
-- Function to increment loyalty points on profiles
CREATE OR REPLACE FUNCTION public.increment_loyalty_points(_user_id UUID, _points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET loyalty_points = COALESCE(loyalty_points, 0) + _points
  WHERE id = _user_id;
END;
$$;
