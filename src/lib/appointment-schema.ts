import { z } from "zod";

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

export const createAppointmentSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20).regex(/^[0-9 ()+-]+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(APPOINTMENT_TIMES),
  notes: z.string().trim().max(500).optional(),
});

export type ValidatedAppointmentInput = z.infer<typeof createAppointmentSchema>;