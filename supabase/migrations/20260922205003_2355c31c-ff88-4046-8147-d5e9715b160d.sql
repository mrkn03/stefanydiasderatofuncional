DROP POLICY IF EXISTS "Visitantes consultam disponibilidade" ON public.appointments;
DROP POLICY IF EXISTS "Visitantes podem solicitar agendamento" ON public.appointments;
DROP POLICY IF EXISTS "Usuária autenticada gerencia agendamentos" ON public.appointments;

REVOKE ALL ON public.appointments FROM anon;
GRANT INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;

ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check,
  ADD CONSTRAINT appointments_status_check CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  DROP CONSTRAINT IF EXISTS appointments_procedure_check,
  ADD CONSTRAINT appointments_procedure_check CHECK (procedure = 'Avaliação dermatofuncional');

CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot_unique
  ON public.appointments (date, time)
  WHERE status <> 'cancelado';

CREATE POLICY "Visitantes solicitam avaliações"
ON public.appointments
FOR INSERT
TO anon
WITH CHECK (
  procedure = 'Avaliação dermatofuncional'
  AND status = 'pendente'
  AND length(btrim(patient_name)) BETWEEN 2 AND 100
  AND length(btrim(phone)) BETWEEN 8 AND 20
  AND date > CURRENT_DATE
  AND time IN ('08:00'::time, '09:00'::time, '10:00'::time, '11:00'::time, '13:00'::time, '14:00'::time, '15:00'::time, '16:00'::time, '17:00'::time, '18:00'::time)
  AND (notes IS NULL OR length(notes) <= 500)
);

CREATE POLICY "Profissionais gerenciam agendamentos"
ON public.appointments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_occupied_slots(p_date date, p_exclude_id uuid DEFAULT NULL)
RETURNS TABLE(date date, "time" time without time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.date, a.time
  FROM public.appointments a
  WHERE a.status <> 'cancelado'
    AND a.date = p_date
    AND (p_exclude_id IS NULL OR a.id <> p_exclude_id);
$$;
REVOKE ALL ON FUNCTION public.get_occupied_slots(date, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_occupied_slots(date, uuid) TO anon, authenticated, service_role;

CREATE TABLE public.clinical_evolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_evolutions TO authenticated;
GRANT ALL ON public.clinical_evolutions TO service_role;
ALTER TABLE public.clinical_evolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais gerenciam evoluções clínicas"
ON public.clinical_evolutions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (auth.uid() = created_by);

CREATE OR REPLACE FUNCTION public.validate_clinical_evolution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = NEW.appointment_id AND status = 'confirmado'
  ) THEN
    RAISE EXCEPTION 'O agendamento deve estar confirmado para registrar a evolução'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_clinical_evolution_before_write
BEFORE INSERT OR UPDATE ON public.clinical_evolutions
FOR EACH ROW EXECUTE FUNCTION public.validate_clinical_evolution();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER clinical_evolutions_set_updated_at
BEFORE UPDATE ON public.clinical_evolutions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.whatsapp_outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  recipient text NOT NULL,
  provider_message_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'sent', 'delivered', 'read', 'failed', 'unresolved')),
  error jsonb,
  accepted_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_outbound_messages TO authenticated;
GRANT ALL ON public.whatsapp_outbound_messages TO service_role;
ALTER TABLE public.whatsapp_outbound_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais consultam avisos do WhatsApp"
ON public.whatsapp_outbound_messages
FOR SELECT
TO authenticated
USING (true);
CREATE TRIGGER whatsapp_outbound_set_updated_at
BEFORE UPDATE ON public.whatsapp_outbound_messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text NOT NULL UNIQUE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_webhook_events TO authenticated;
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais consultam eventos do WhatsApp"
ON public.whatsapp_webhook_events
FOR SELECT
TO authenticated
USING (true);
CREATE INDEX whatsapp_webhook_pending_idx
ON public.whatsapp_webhook_events (next_attempt_at, received_at)
WHERE processed_at IS NULL;

CREATE OR REPLACE FUNCTION public.apply_whatsapp_statuses(p_limit integer DEFAULT 25)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_row record;
  status_row jsonb;
  affected integer;
  processed_count integer := 0;
  provider_id text;
  status_value text;
  provider_time timestamptz;
BEGIN
  FOR event_row IN
    SELECT * FROM public.whatsapp_webhook_events
    WHERE processed_at IS NULL AND next_attempt_at <= now()
    ORDER BY next_attempt_at, received_at
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      IF event_row.event = 'whatsapp.status' THEN
        affected := 0;
        FOR status_row IN
          SELECT value
          FROM jsonb_array_elements(
            COALESCE(event_row.payload #> '{entry,0,changes,0,value,statuses}', '[]'::jsonb)
          )
        LOOP
          provider_id := status_row->>'id';
          status_value := status_row->>'status';
          provider_time := CASE
            WHEN status_row ? 'timestamp' THEN to_timestamp((status_row->>'timestamp')::double precision)
            ELSE now()
          END;
          UPDATE public.whatsapp_outbound_messages
          SET status = CASE
                WHEN status_value = 'failed' THEN 'failed'
                WHEN status = 'read' THEN status
                WHEN status = 'delivered' AND status_value IN ('sent', 'accepted') THEN status
                WHEN status = 'sent' AND status_value = 'accepted' THEN status
                WHEN status_value IN ('sent', 'delivered', 'read') THEN status_value
                ELSE status
              END,
              error = CASE WHEN status_value = 'failed' THEN status_row->'errors' ELSE error END,
              sent_at = CASE WHEN status_value = 'sent' AND sent_at IS NULL THEN provider_time ELSE sent_at END,
              delivered_at = CASE WHEN status_value = 'delivered' AND delivered_at IS NULL THEN provider_time ELSE delivered_at END,
              read_at = CASE WHEN status_value = 'read' AND read_at IS NULL THEN provider_time ELSE read_at END,
              failed_at = CASE WHEN status_value = 'failed' AND failed_at IS NULL THEN provider_time ELSE failed_at END
          WHERE provider_message_id = provider_id;
          GET DIAGNOSTICS affected = ROW_COUNT;
          IF affected = 0 THEN
            RAISE EXCEPTION 'Outbound message % not available yet', provider_id;
          END IF;
        END LOOP;
      END IF;
      UPDATE public.whatsapp_webhook_events
      SET processed_at = now(), processing_error = NULL, attempts = attempts + 1
      WHERE id = event_row.id;
      processed_count := processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.whatsapp_webhook_events
      SET processing_error = SQLERRM,
          attempts = attempts + 1,
          next_attempt_at = now() + make_interval(secs => LEAST(3600, 30 * (attempts + 1)))
      WHERE id = event_row.id;
    END;
  END LOOP;
  RETURN processed_count;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_whatsapp_statuses(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_whatsapp_statuses(integer) TO service_role;