DROP VIEW public.occupied_slots;
CREATE OR REPLACE FUNCTION public.get_occupied_slots(p_date date)
RETURNS TABLE(date date, "time" time)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.date, a.time FROM public.appointments a
  WHERE a.status <> 'cancelado' AND a.date = p_date;
$$;
REVOKE ALL ON FUNCTION public.get_occupied_slots(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_occupied_slots(date) TO anon;
GRANT EXECUTE ON FUNCTION public.get_occupied_slots(date) TO authenticated;