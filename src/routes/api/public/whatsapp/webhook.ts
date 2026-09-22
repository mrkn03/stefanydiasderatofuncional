import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WHATSAPP_API_KEY"];
        if (!secret) return new Response("WhatsApp unavailable", { status: 503 });

        let verified: { payload: unknown };
        try {
          verified = await verifyWebhookRequest({
            req: request,
            secret,
            maxBodyBytes: 4 * 1024 * 1024,
          });
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        const deliveryId = request.headers.get("x-lovable-delivery")?.trim();
        const event = request.headers.get("x-lovable-event")?.trim();
        if (!deliveryId || !event) return new Response("Missing delivery headers", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: stored, error } = await supabaseAdmin
          .from("whatsapp_webhook_events")
          .upsert(
            { delivery_id: deliveryId, event, payload: verified.payload },
            { onConflict: "delivery_id", ignoreDuplicates: true },
          )
          .select("id, processed_at")
          .maybeSingle();
        if (error) {
          console.error("WhatsApp webhook persistence failed", error.code);
          return new Response("Persistence failed", { status: 500 });
        }
        if (stored?.processed_at) return new Response("ok");

        const { error: processingError } = await supabaseAdmin.rpc("apply_whatsapp_statuses", {
          p_limit: 25,
        });
        if (processingError) {
          console.error("WhatsApp webhook processing failed", processingError.code);
          return new Response("Processing failed", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});