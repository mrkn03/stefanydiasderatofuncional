import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const appointmentSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9()+\-\s]{8,20}$/),
  procedure: z.string().trim().min(2).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(500).optional(),
});

function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getOccupiedSlots = createServerFn({ method: "GET" })
  .inputValidator((input: { date: string }) => z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { data: slots, error } = await createPublicClient().rpc("get_occupied_slots", { p_date: data.date });
    if (error) throw new Error("Não foi possível consultar os horários.");
    return (slots ?? []).map((slot: { time: string }) => slot.time.slice(0, 5));
  });

export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((input) => appointmentSchema.parse(input))
  .handler(async ({ data }) => {
    const client = createPublicClient();
    const { data: occupied } = await client.rpc("get_occupied_slots", { p_date: data.date });
    if ((occupied ?? []).some((slot: { time: string }) => slot.time.slice(0, 5) === data.time)) {
      throw new Error("Este horário acabou de ser reservado. Escolha outro.");
    }
    const { error } = await client.from("appointments").insert({
      patient_name: data.patientName,
      phone: data.phone,
      procedure: data.procedure,
      date: data.date,
      time: data.time,
      notes: data.notes || null,
    });
    if (error) throw new Error("Não foi possível solicitar o horário.");
    return { ok: true };
  });

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("appointments").select("*").order("date").order("time");
    if (error) throw new Error("Não foi possível carregar os agendamentos.");
    return data ?? [];
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pendente", "confirmado", "cancelado"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("appointments").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Não foi possível atualizar o agendamento.");
    return { ok: true };
  });