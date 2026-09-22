import { createFileRoute } from "@tanstack/react-router";
import { createAppointmentSchema, DERMATOFUNCTIONAL_EVALUATION } from "@/lib/appointment-schema";

const RECIPIENT = "5527988333769";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

export const Route = createFileRoute("/api/appointments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) {
          return Response.json({ message: "Solicitação não autorizada." }, { status: 403 });
        }

        const input = createAppointmentSchema.safeParse(await request.json().catch(() => null));
        if (!input.success) {
          return Response.json(
            { message: "Revise os dados informados para o agendamento." },
            { status: 400 },
          );
        }
        if (input.data.date <= new Date().toISOString().slice(0, 10)) {
          return Response.json({ message: "Escolha uma data futura." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: appointment, error } = await supabaseAdmin
          .from("appointments")
          .insert({
            patient_name: input.data.patientName,
            phone: input.data.phone,
            procedure: DERMATOFUNCTIONAL_EVALUATION,
            date: input.data.date,
            time: input.data.time,
            notes: input.data.notes || null,
            status: "pendente",
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            return Response.json(
              { message: "Este horário acabou de ser reservado. Escolha outro." },
              { status: 409 },
            );
          }
          console.error("Appointment insert failed", error.code);
          return Response.json({ message: "Não foi possível solicitar o horário." }, { status: 500 });
        }

        const { data: outbound } = await supabaseAdmin
          .from("whatsapp_outbound_messages")
          .insert({ appointment_id: appointment.id, recipient: RECIPIENT, status: "pending" })
          .select("id")
          .single();

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const whatsappKey = process.env["WHATSAPP_API_KEY"];
        if (outbound && lovableKey && whatsappKey) {
          const dateLabel = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(
            new Date(`${appointment.date}T12:00:00-03:00`),
          );
          const sendResponse = await fetch(`${GATEWAY_URL}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": whatsappKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: RECIPIENT,
              type: "text",
              text: {
                body: `Novo pedido de avaliação dermatofuncional\nPaciente: ${appointment.patient_name}\nWhatsApp: ${appointment.phone}\nData: ${dateLabel}\nHorário: ${appointment.time.slice(0, 5)}`,
              },
            }),
          });
          const sendBody = (await sendResponse.json().catch(() => null)) as
            | { messages?: Array<{ id?: string }>; error?: unknown }
            | null;
          const providerMessageId = sendBody?.messages?.[0]?.id;
          await supabaseAdmin
            .from("whatsapp_outbound_messages")
            .update(
              sendResponse.ok && providerMessageId
                ? {
                    status: "accepted",
                    provider_message_id: providerMessageId,
                    accepted_at: new Date().toISOString(),
                  }
                : {
                    status: "failed",
                    error: { providerStatus: sendResponse.status },
                    failed_at: new Date().toISOString(),
                  },
            )
            .eq("id", outbound.id);
          if (!sendResponse.ok) console.error("WhatsApp notification was not accepted", sendResponse.status);
          else await supabaseAdmin.rpc("apply_whatsapp_statuses", { p_limit: 25 });
        } else if (outbound) {
          await supabaseAdmin
            .from("whatsapp_outbound_messages")
            .update({
              status: "failed",
              error: { reason: "whatsapp_not_connected" },
              failed_at: new Date().toISOString(),
            })
            .eq("id", outbound.id);
        }

        return Response.json({
          id: appointment.id,
          patientName: appointment.patient_name,
          phone: appointment.phone,
          procedure: appointment.procedure,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          notes: appointment.notes,
          createdAt: appointment.created_at,
        });
      },
    },
  },
});