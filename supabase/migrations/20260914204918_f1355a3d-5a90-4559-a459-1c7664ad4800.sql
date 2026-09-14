CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  procedure TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitantes podem solicitar agendamento" ON public.appointments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Usuária autenticada gerencia agendamentos" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE VIEW public.occupied_slots AS SELECT date, time FROM public.appointments WHERE status <> 'cancelado';
GRANT SELECT ON public.occupied_slots TO anon;
GRANT SELECT ON public.occupied_slots TO authenticated;