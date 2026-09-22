ALTER FUNCTION public.get_occupied_slots(date, uuid) SECURITY INVOKER;
GRANT SELECT (id, date, time, status) ON public.appointments TO anon;
DROP POLICY IF EXISTS "Visitantes consultam somente disponibilidade" ON public.appointments;
CREATE POLICY "Visitantes consultam somente disponibilidade"
ON public.appointments
FOR SELECT
TO anon
USING (true);