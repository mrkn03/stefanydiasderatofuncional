import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  APPOINTMENT_TIMES,
  createAppointmentSchema,
  DERMATOFUNCTIONAL_EVALUATION,
} from "@/lib/appointment-schema";

export type AppointmentStatus = "pendente" | "confirmado" | "cancelado";
export { APPOINTMENT_TIMES, DERMATOFUNCTIONAL_EVALUATION };

export type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  procedure: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
};

export type CreateAppointmentInput = Pick<
  Appointment,
  "patientName" | "phone" | "date" | "time"
> & { notes?: string };

export type CreateClinicalEvolutionInput = {
  address: string;
  sex: string;
  neighborhood: string;
  city: string;
  state: string;
  birthDate: string;
  nationality: string;
  maritalStatus: string;
  education: string;
  profession: string;
  responsible: string;
  specialty: string;
  admissionDate: string;
  chiefComplaint: string;
  currentHistory: string;
  previousHistory: string;
  familyHistory: string;
  skinCancer: string;
  habits: string[];
  otherHabits: string;
  medications: string;
  cosmetics: string;
  botox: string;
  sunscreen: string;
  allergies: string;
  diet: string;
  menstrualStatus: string;
  menarcheAge: string;
  previousFacialTreatment: string;
  skinColor: string;
  skinType: string;
  glogauType: string;
  fitzpatrickType: string;
  hairLocations: string[];
  acneGrade: string;
  skinAlterations: string[];
  skinLaxity: string;
  skinLaxityLocation: string;
  wrinkles: string;
  wrinkleLocations: string[];
  wrinkleType: string;
  tsujiClassification: string;
  lapierePierardGrade: string;
  dentalAssessment: string[];
  touch: string;
  muscleTone: string;
  hydration: string;
  woodLamp: string[];
  facialMeasurements: string;
  postoperativeFindings: string[];
  pain: string;
  sensitivity: string;
  imageAssessment: string;
  clinicalDiagnosis: string;
  objective: string;
  conduct: string;
};

export type ClinicalEvolution = CreateClinicalEvolutionInput & {
  id: string;
  appointmentId: string;
  createdAt: string;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const optionalClinicalText = z.string().trim().max(2000);
const requiredClinicalText = z.string().trim().min(2).max(4000);
const clinicalList = z.array(z.string().trim().min(1).max(100)).max(30);
const evolutionSchema = z.object({
  address: optionalClinicalText,
  sex: optionalClinicalText,
  neighborhood: optionalClinicalText,
  city: optionalClinicalText,
  state: optionalClinicalText,
  birthDate: optionalClinicalText,
  nationality: optionalClinicalText,
  maritalStatus: optionalClinicalText,
  education: optionalClinicalText,
  profession: optionalClinicalText,
  responsible: optionalClinicalText,
  specialty: optionalClinicalText,
  admissionDate: optionalClinicalText,
  chiefComplaint: requiredClinicalText,
  currentHistory: optionalClinicalText,
  previousHistory: optionalClinicalText,
  familyHistory: optionalClinicalText,
  skinCancer: optionalClinicalText,
  habits: clinicalList,
  otherHabits: optionalClinicalText,
  medications: optionalClinicalText,
  cosmetics: optionalClinicalText,
  botox: optionalClinicalText,
  sunscreen: optionalClinicalText,
  allergies: optionalClinicalText,
  diet: optionalClinicalText,
  menstrualStatus: optionalClinicalText,
  menarcheAge: optionalClinicalText,
  previousFacialTreatment: optionalClinicalText,
  skinColor: optionalClinicalText,
  skinType: optionalClinicalText,
  glogauType: optionalClinicalText,
  fitzpatrickType: optionalClinicalText,
  hairLocations: clinicalList,
  acneGrade: optionalClinicalText,
  skinAlterations: clinicalList,
  skinLaxity: optionalClinicalText,
  skinLaxityLocation: optionalClinicalText,
  wrinkles: optionalClinicalText,
  wrinkleLocations: clinicalList,
  wrinkleType: optionalClinicalText,
  tsujiClassification: optionalClinicalText,
  lapierePierardGrade: optionalClinicalText,
  dentalAssessment: clinicalList,
  touch: optionalClinicalText,
  muscleTone: optionalClinicalText,
  hydration: optionalClinicalText,
  woodLamp: clinicalList,
  facialMeasurements: optionalClinicalText,
  postoperativeFindings: clinicalList,
  pain: optionalClinicalText,
  sensitivity: optionalClinicalText,
  imageAssessment: optionalClinicalText,
  clinicalDiagnosis: requiredClinicalText,
  objective: requiredClinicalText,
  conduct: requiredClinicalText,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(
      body?.message ?? "Não foi possível concluir a solicitação.",
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function mapAppointment(row: {
  id: string; patient_name: string; phone: string; procedure: string; date: string;
  time: string; status: string; notes: string | null; created_at: string;
}): Appointment {
  return {
    id: row.id, patientName: row.patient_name, phone: row.phone, procedure: row.procedure,
    date: row.date, time: row.time, status: row.status as AppointmentStatus,
    notes: row.notes, createdAt: row.created_at,
  };
}

export async function getOccupiedSlots(date: string, excludeId?: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_occupied_slots", {
    p_date: date,
    ...(excludeId ? { p_exclude_id: excludeId } : {}),
  });
  if (error) throw new ApiError("Não foi possível consultar os horários.", 500);
  return data.map((item) => item.time.slice(0, 5));
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) throw new ApiError("Revise os dados informados para o agendamento.", 400);
  return request<Appointment>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}

export async function login(email: string, password: string): Promise<void> {
  if (!email || !password) throw new ApiError("Informe e-mail e senha.", 400);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError("E-mail ou senha incorretos.", 401);
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new ApiError("Não foi possível sair.", 500);
}

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("date")
    .order("time");
  if (error) throw new ApiError("Não foi possível carregar a agenda.", 500);
  return data.map(mapAppointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<void> {
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw new ApiError("Não foi possível atualizar o agendamento.", 500);
}

export async function rescheduleAppointment(id: string, date: string, time: string): Promise<void> {
  const parsed = z
    .object({ date: z.string().regex(datePattern), time: z.enum(APPOINTMENT_TIMES) })
    .safeParse({
      date,
      time,
    });
  if (!parsed.success) throw new ApiError("Escolha uma data e um horário válidos.", 400);
  const { error } = await supabase.from("appointments").update(parsed.data).eq("id", id);
  if (error?.code === "23505") throw new ApiError("Este horário acabou de ser reservado. Escolha outro.", 409);
  if (error) throw new ApiError("Não foi possível reagendar.", 500);
}

export async function listClinicalEvolutions(appointmentId: string): Promise<ClinicalEvolution[]> {
  const { data, error } = await supabase
    .from("clinical_evolutions")
    .select("id, appointment_id, data, created_at")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false });
  if (error) throw new ApiError("Não foi possível carregar o histórico clínico.", 500);
  return data.map((row) => ({
    ...(row.data as unknown as CreateClinicalEvolutionInput),
    id: row.id,
    appointmentId: row.appointment_id,
    createdAt: row.created_at,
  }));
}

export async function createClinicalEvolution(
  appointmentId: string,
  input: CreateClinicalEvolutionInput,
): Promise<ClinicalEvolution> {
  const parsed = evolutionSchema.safeParse(input);
  if (!parsed.success) throw new ApiError("Preencha todos os campos da evolução clínica.", 400);
  const { data, error } = await supabase
    .from("clinical_evolutions")
    .insert({ appointment_id: appointmentId, data: parsed.data })
    .select("id, appointment_id, data, created_at")
    .single();
  if (error?.code === "23514") {
    throw new ApiError("Confirme o agendamento antes de evoluir o paciente.", 409);
  }
  if (error) throw new ApiError("Não foi possível salvar a evolução.", 500);
  return {
    ...(data.data as unknown as CreateClinicalEvolutionInput),
    id: data.id,
    appointmentId: data.appointment_id,
    createdAt: data.created_at,
  };
}
