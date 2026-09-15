import { z } from "zod";

export type AppointmentStatus = "pendente" | "confirmado" | "cancelado";

export const DERMATOFUNCTIONAL_EVALUATION = "Avaliação dermatofuncional";
export const APPOINTMENT_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

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
const phonePattern = /^[0-9 ()+-]+$/;
const createAppointmentSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20).regex(phonePattern),
  date: z.string().regex(datePattern),
  time: z.enum(APPOINTMENT_TIMES),
  notes: z.string().trim().max(500).optional(),
});
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

const apiBaseUrl =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";
const demoAppointmentsKey = "stefany-demo-appointments";
const demoSessionKey = "stefany-demo-admin";
const demoEvolutionsKey = "stefany-demo-evolutions";

export const isDemoMode = !apiBaseUrl;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
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

function readDemoAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(demoAppointmentsKey);
  if (stored) {
    try {
      return JSON.parse(stored) as Appointment[];
    } catch {
      window.localStorage.removeItem(demoAppointmentsKey);
    }
  }
  return [];
}

function writeDemoAppointments(appointments: Appointment[]) {
  window.localStorage.setItem(demoAppointmentsKey, JSON.stringify(appointments));
}

function readDemoEvolutions(): ClinicalEvolution[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(demoEvolutionsKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ClinicalEvolution[];
  } catch {
    window.localStorage.removeItem(demoEvolutionsKey);
    return [];
  }
}

function writeDemoEvolutions(evolutions: ClinicalEvolution[]) {
  window.localStorage.setItem(demoEvolutionsKey, JSON.stringify(evolutions));
}

export async function getOccupiedSlots(date: string, excludeId?: string): Promise<string[]> {
  if (!isDemoMode) {
    const query = new URLSearchParams({ date });
    if (excludeId) query.set("excludeId", excludeId);
    return request<string[]>(`/api/appointments/occupied-slots?${query.toString()}`);
  }
  return readDemoAppointments()
    .filter((item) => item.id !== excludeId && item.date === date && item.status !== "cancelado")
    .map((item) => item.time);
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) throw new ApiError("Revise os dados informados para o agendamento.", 400);
  const payload = { ...parsed.data, procedure: DERMATOFUNCTIONAL_EVALUATION };
  if (!isDemoMode) {
    return request<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  const appointments = readDemoAppointments();
  const unavailable = appointments.some(
    (item) =>
      item.date === payload.date && item.time === payload.time && item.status !== "cancelado",
  );
  if (unavailable) throw new ApiError("Este horário acabou de ser reservado. Escolha outro.", 409);
  const appointment: Appointment = {
    ...payload,
    id: crypto.randomUUID(),
    notes: payload.notes?.trim() || null,
    status: "pendente",
    createdAt: new Date().toISOString(),
  };
  writeDemoAppointments([...appointments, appointment]);
  return appointment;
}

export async function login(email: string, password: string): Promise<void> {
  if (!isDemoMode) {
    await request<void>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return;
  }
  if (!email || !password) throw new ApiError("Informe e-mail e senha.", 400);
  window.sessionStorage.setItem(demoSessionKey, "true");
}

export async function logout(): Promise<void> {
  if (!isDemoMode) await request<void>("/api/auth/logout", { method: "POST" });
  else window.sessionStorage.removeItem(demoSessionKey);
}

export async function hasAdminSession(): Promise<boolean> {
  if (isDemoMode) return window.sessionStorage.getItem(demoSessionKey) === "true";
  try {
    await request<{ authenticated: true }>("/api/auth/session");
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return false;
    throw error;
  }
}

export async function listAppointments(): Promise<Appointment[]> {
  if (!isDemoMode) return request<Appointment[]>("/api/admin/appointments");
  return readDemoAppointments().sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<void> {
  if (!isDemoMode) {
    await request<void>(`/api/admin/appointments/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return;
  }
  writeDemoAppointments(
    readDemoAppointments().map((item) => (item.id === id ? { ...item, status } : item)),
  );
}

export async function rescheduleAppointment(id: string, date: string, time: string): Promise<void> {
  const parsed = z
    .object({ date: z.string().regex(datePattern), time: z.enum(APPOINTMENT_TIMES) })
    .safeParse({
      date,
      time,
    });
  if (!parsed.success) throw new ApiError("Escolha uma data e um horário válidos.", 400);
  if (!isDemoMode) {
    await request<void>(`/api/admin/appointments/${encodeURIComponent(id)}/schedule`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return;
  }
  const appointments = readDemoAppointments();
  const unavailable = appointments.some(
    (item) =>
      item.id !== id &&
      item.date === parsed.data.date &&
      item.time === parsed.data.time &&
      item.status !== "cancelado",
  );
  if (unavailable) throw new ApiError("Este horário acabou de ser reservado. Escolha outro.", 409);
  writeDemoAppointments(
    appointments.map((item) => (item.id === id ? { ...item, ...parsed.data } : item)),
  );
}

export async function listClinicalEvolutions(appointmentId: string): Promise<ClinicalEvolution[]> {
  if (!isDemoMode) {
    return request<ClinicalEvolution[]>(
      `/api/admin/appointments/${encodeURIComponent(appointmentId)}/evolutions`,
    );
  }
  return readDemoEvolutions()
    .filter((item) => item.appointmentId === appointmentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createClinicalEvolution(
  appointmentId: string,
  input: CreateClinicalEvolutionInput,
): Promise<ClinicalEvolution> {
  const parsed = evolutionSchema.safeParse(input);
  if (!parsed.success) throw new ApiError("Preencha todos os campos da evolução clínica.", 400);
  if (!isDemoMode) {
    return request<ClinicalEvolution>(
      `/api/admin/appointments/${encodeURIComponent(appointmentId)}/evolutions`,
      { method: "POST", body: JSON.stringify(parsed.data) },
    );
  }
  const appointment = readDemoAppointments().find((item) => item.id === appointmentId);
  if (!appointment) throw new ApiError("Agendamento não encontrado.", 404);
  if (appointment.status !== "confirmado") {
    throw new ApiError("Confirme o agendamento antes de evoluir o paciente.", 409);
  }
  const evolution: ClinicalEvolution = {
    ...parsed.data,
    id: crypto.randomUUID(),
    appointmentId,
    createdAt: new Date().toISOString(),
  };
  writeDemoEvolutions([...readDemoEvolutions(), evolution]);
  return evolution;
}
