CREATE OR REPLACE FUNCTION public.get_occupied_slots(p_date date)
RETURNS TABLE(date date, "time" time)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT a.date, a.time FROM public.appointments a
  WHERE a.status <> 'cancelado' AND a.date = p_date;
$$;
GRANT SELECT (date, time, status) ON public.appointments TO anon;
CREATE POLICY "Visitantes consultam disponibilidade" ON public.appointments FOR SELECT TO anon USING (true);