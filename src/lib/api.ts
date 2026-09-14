export type AppointmentStatus = "pendente" | "confirmado" | "cancelado";

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
  "patientName" | "phone" | "procedure" | "date" | "time"
> & { notes?: string };

const apiBaseUrl =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";
const demoAppointmentsKey = "stefany-demo-appointments";
const demoSessionKey = "stefany-demo-admin";

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

export async function getOccupiedSlots(date: string): Promise<string[]> {
  if (!isDemoMode) {
    return request<string[]>(`/api/appointments/occupied-slots?date=${encodeURIComponent(date)}`);
  }
  return readDemoAppointments()
    .filter((item) => item.date === date && item.status !== "cancelado")
    .map((item) => item.time);
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  if (!isDemoMode) {
    return request<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  const appointments = readDemoAppointments();
  const unavailable = appointments.some(
    (item) => item.date === input.date && item.time === input.time && item.status !== "cancelado",
  );
  if (unavailable) throw new ApiError("Este horário acabou de ser reservado. Escolha outro.", 409);
  const appointment: Appointment = {
    ...input,
    id: crypto.randomUUID(),
    notes: input.notes?.trim() || null,
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
