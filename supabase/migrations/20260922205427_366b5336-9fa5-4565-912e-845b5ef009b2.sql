ALTER FUNCTION public.get_occupied_slots(date, uuid) SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.get_occupied_slots(date, uuid) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_occupied_slots(date, uuid) TO anon, service_role;
REVOKE SELECT ON public.appointments FROM anon;