import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout } from "@/components/page-layout";
import {
  APPOINTMENT_TIMES,
  createAppointment,
  DERMATOFUNCTIONAL_EVALUATION,
  getOccupiedSlots,
  isDemoMode,
} from "@/lib/api";

export const Route = createFileRoute("/agendamento")({
  head: () => ({
    meta: [
      { title: "Agendamento | Dra. Stefany Dias" },
      {
        name: "description",
        content:
          "Escolha a data e o horário para solicitar sua avaliação dermatofuncional com a Dra. Stefany Dias.",
      },
      { property: "og:title", content: "Agendamento | Dra. Stefany Dias" },
      {
        property: "og:description",
        content: "Solicite seu horário online de forma rápida e segura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Booking,
});
function Booking() {
  const phoneNumber = "5527988333769";
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [occupied, setOccupied] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const minDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);
  useEffect(() => {
    if (!date) {
      setOccupied([]);
      return;
    }
    getOccupiedSlots(date)
      .then(setOccupied)
      .catch(() => setOccupied([]));
  }, [date]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    try {
      await createAppointment({
        patientName: String(f.get("name")),
        phone: String(f.get("phone")),
        date,
        time,
        notes: String(f.get("notes") || ""),
      });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível solicitar o horário.");
    } finally {
      setLoading(false);
    }
  }
  if (done)
    return (
      <PageLayout
        eyebrow="Agendamento"
        title={isDemoMode ? "Demonstração concluída!" : "Solicitação recebida!"}
        intro={
          isDemoMode
            ? "O formulário funcionou em modo demonstrativo. Conecte a API .NET para receber agendamentos reais."
            : "A Dra. Stefany entrará em contato pelo WhatsApp informado para confirmar o atendimento."
        }
      >
        <section className="mx-auto max-w-xl px-5 py-20 text-center">
          <CheckCircle2 className="mx-auto size-14 text-rosedeep" />
          <p className="mt-6 text-inksoft">
            {isDemoMode
              ? "Os dados ficaram somente neste navegador e não foram enviados."
              : "Seu horário foi reservado como pendente até a confirmação."}
          </p>
          <Button asChild variant="outline" className="mt-8 rounded-full border-rose/50">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </section>
      </PageLayout>
    );
  return (
    <PageLayout
      eyebrow="Agendamento"
      title="Agende sua avaliação dermatofuncional."
      intro="Escolha a data e um dos horários disponíveis. Os procedimentos indicados serão definidos individualmente após a avaliação."
    >
      <section className="mx-auto max-w-2xl px-5 py-20 sm:px-6">
        {isDemoMode && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-rose/40 bg-mist px-5 py-4 text-sm text-inksoft"
          >
            <strong className="font-semibold text-ink">Modo demonstrativo:</strong> nenhum
            agendamento real será enviado até a API .NET ser conectada.
          </div>
        )}
        <form
          onSubmit={submit}
          className="edge grid gap-6 rounded-2xl bg-milk p-7 ring-1 ring-rose/30 sm:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                required
                minLength={2}
                maxLength={100}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                minLength={8}
                maxLength={20}
                placeholder="(27) 99999-9999"
                className="mt-2"
              />
            </div>
          </div>
          <div className="rounded-lg border border-rose/30 bg-mist px-4 py-3">
            <p className="text-xs font-semibold uppercase text-rosedeep">Atendimento inicial</p>
            <p className="mt-1 font-medium text-ink">{DERMATOFUNCTIONAL_EVALUATION}</p>
            <p className="mt-1 text-sm text-inksoft">
              O plano de tratamento e os procedimentos serão definidos após esta avaliação.
            </p>
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              min={minDate}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label>Horário</Label>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {APPOINTMENT_TIMES.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={time === t ? "default" : "outline"}
                  disabled={!date || occupied.includes(t)}
                  onClick={() => setTime(t)}
                  className={
                    time === t
                      ? "bg-rosedeep text-primary-foreground hover:bg-rosedeep/90"
                      : "border-rose/40"
                  }
                >
                  {t}
                </Button>
              ))}
            </div>
            {date && (
              <p className="mt-2 text-xs text-inksoft">Horários apagados já estão ocupados.</p>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input id="notes" name="notes" maxLength={500} className="mt-2" />
          </div>
          <Button
            type="submit"
            disabled={loading || !date || !time}
            className="rounded-full bg-rosedeep text-primary-foreground hover:bg-rosedeep/90"
          >
            {loading ? "Enviando..." : "Solicitar agendamento"}
          </Button>
          <a
            href={`https://wa.me/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent("Olá, Dra. Stefany! Gostaria de agendar uma avaliação.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm font-medium text-rosedeep"
          >
            <MessageCircle className="size-4" />
            Prefiro agendar pelo WhatsApp
          </a>
        </form>
      </section>
    </PageLayout>
  );
}
