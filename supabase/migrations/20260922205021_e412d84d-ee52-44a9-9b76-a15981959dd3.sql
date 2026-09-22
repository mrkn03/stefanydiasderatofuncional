DROP FUNCTION IF EXISTS public.get_occupied_slots(date);

GRANT SELECT (id, date, time, status) ON public.appointments TO anon;
CREATE POLICY "Visitantes consultam somente disponibilidade"
ON public.appointments
FOR SELECT
TO anon
USING (true);

ALTER FUNCTION public.get_occupied_slots(date, uuid) SECURITY INVOKER;
ALTER FUNCTION public.validate_clinical_evolution() SECURITY INVOKER;
ALTER FUNCTION public.apply_whatsapp_statuses(integer) SECURITY INVOKER;

REVOKE ALL ON FUNCTION public.validate_clinical_evolution() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_whatsapp_statuses(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_clinical_evolution() TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_whatsapp_statuses(integer) TO service_role;