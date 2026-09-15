import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarDays, Check, ClipboardPlus, LogOut, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClinicalEvolutionDetails,
  ClinicalEvolutionForm,
  emptyClinicalEvolution,
} from "@/components/clinical-evolution-form";
import {
  APPOINTMENT_TIMES,
  createClinicalEvolution,
  getOccupiedSlots,
  isDemoMode,
  listAppointments,
  listClinicalEvolutions,
  logout,
  rescheduleAppointment,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
  type ClinicalEvolution,
  type CreateClinicalEvolutionInput,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Agenda e evolução clínica | Dra. Stefany Dias" },
      { name: "description", content: "Gestão privada da agenda e das evoluções clínicas." },
      { property: "og:title", content: "Agenda e evolução clínica | Dra. Stefany Dias" },
      { property: "og:description", content: "Gestão privada da agenda e das evoluções clínicas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const router = useRouter();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [occupied, setOccupied] = useState<string[]>([]);
  const [evolving, setEvolving] = useState<Appointment | null>(null);
  const [evolution, setEvolution] = useState(emptyClinicalEvolution);
  const [history, setHistory] = useState<ClinicalEvolution[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const minDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);

  async function reload() {
    try {
      setItems(await listAppointments());
    } catch {
      toast.error("Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!rescheduling || !newDate) {
      setOccupied([]);
      return;
    }
    getOccupiedSlots(newDate, rescheduling.id)
      .then(setOccupied)
      .catch(() => setOccupied([]));
  }, [newDate, rescheduling]);

  async function change(id: string, status: AppointmentStatus) {
    setBusyId(id);
    try {
      await updateAppointmentStatus(id, status);
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      toast.success(status === "confirmado" ? "Agendamento confirmado." : "Agendamento cancelado.");
    } catch {
      toast.error("Não foi possível atualizar o agendamento.");
    } finally {
      setBusyId(null);
    }
  }

  function openReschedule(item: Appointment) {
    setRescheduling(item);
    setNewDate(item.date < minDate ? "" : item.date);
    setNewTime(item.date < minDate ? "" : item.time.slice(0, 5));
  }

  async function saveReschedule() {
    if (!rescheduling || !newDate || !newTime) return;
    setBusyId(rescheduling.id);
    try {
      await rescheduleAppointment(rescheduling.id, newDate, newTime);
      setItems((current) =>
        current.map((item) =>
          item.id === rescheduling.id ? { ...item, date: newDate, time: newTime } : item,
        ),
      );
      setRescheduling(null);
      toast.success("Agendamento reagendado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reagendar.");
    } finally {
      setBusyId(null);
    }
  }

  async function openEvolution(item: Appointment) {
    setEvolving(item);
    setEvolution(emptyClinicalEvolution);
    setHistoryLoading(true);
    try {
      setHistory(await listClinicalEvolutions(item.id));
    } catch {
      toast.error("Não foi possível carregar o histórico clínico.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function saveEvolution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!evolving) return;
    setBusyId(evolving.id);
    try {
      const created = await createClinicalEvolution(evolving.id, evolution);
      setHistory((current) => [created, ...current]);
      setEvolution(emptyClinicalEvolution);
      toast.success("Evolução clínica registrada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a evolução.");
    } finally {
      setBusyId(null);
    }
  }

  async function leave() {
    await logout();
    await router.navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-milk px-5 py-8 text-ink sm:px-6">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-rosedeep">Área profissional</p>
          <h1 className="mt-2 font-display text-3xl">Agenda</h1>
        </div>
        <Button variant="outline" size="icon" onClick={leave} aria-label="Sair" title="Sair">
          <LogOut />
        </Button>
      </header>
      <main className="mx-auto mt-10 max-w-6xl">
        {isDemoMode && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-rose/40 bg-mist px-5 py-4 text-sm text-inksoft"
          >
            <strong className="font-semibold text-ink">Agenda demonstrativa:</strong> os registros e
            as evoluções existem somente neste navegador.
          </div>
        )}
        {loading ? (
          <p className="text-sm text-inksoft">Carregando agenda...</p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-rose/30 p-10 text-center">
            <CalendarDays className="mx-auto size-8 text-rosedeep" />
            <p className="mt-4 text-inksoft">Nenhum agendamento recebido.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-rose/30 bg-milk p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-rosedeep">
                      {new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")} ·{" "}
                      {item.time.slice(0, 5)}
                    </p>
                    <h2 className="mt-2 font-display text-xl">{item.patientName}</h2>
                    <p className="mt-1 text-sm text-inksoft">{item.procedure}</p>
                    <a
                      href={`tel:${item.phone}`}
                      className="mt-3 flex items-center gap-2 text-sm text-rosedeep"
                    >
                      <Phone className="size-4" />
                      {item.phone}
                    </a>
                    {item.notes && <p className="mt-3 text-sm text-inksoft">{item.notes}</p>}
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-56">
                    <span className="text-xs font-semibold uppercase text-inksoft">
                      {item.status === "pendente"
                        ? "Pendente"
                        : item.status === "confirmado"
                          ? "Confirmado"
                          : "Cancelado"}
                    </span>
                    {item.status !== "confirmado" && (
                      <Button
                        disabled={busyId === item.id}
                        onClick={() => change(item.id, "confirmado")}
                      >
                        <Check /> Confirmar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      disabled={busyId === item.id}
                      onClick={() => openReschedule(item)}
                    >
                      <CalendarClock /> Reagendar
                    </Button>
                    {item.status === "confirmado" && (
                      <Button variant="secondary" onClick={() => void openEvolution(item)}>
                        <ClipboardPlus /> Evoluir paciente
                      </Button>
                    )}
                    {item.status !== "cancelado" && (
                      <Button
                        variant="ghost"
                        disabled={busyId === item.id}
                        onClick={() => change(item.id, "cancelado")}
                      >
                        <X /> Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Dialog open={Boolean(rescheduling)} onOpenChange={(open) => !open && setRescheduling(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-rose/30 bg-milk sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">
              Reagendar avaliação
            </DialogTitle>
            <DialogDescription>
              Escolha uma nova data e um horário disponível para {rescheduling?.patientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div>
              <Label htmlFor="reschedule-date">Nova data</Label>
              <Input
                id="reschedule-date"
                type="date"
                min={minDate}
                value={newDate}
                onChange={(event) => {
                  setNewDate(event.target.value);
                  setNewTime("");
                }}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Novo horário</Label>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {APPOINTMENT_TIMES.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={newTime === time ? "default" : "outline"}
                    disabled={!newDate || occupied.includes(time)}
                    onClick={() => setNewTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduling(null)}>
              Voltar
            </Button>
            <Button
              disabled={!newDate || !newTime || busyId === rescheduling?.id}
              onClick={saveReschedule}
            >
              Salvar reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(evolving)} onOpenChange={(open) => !open && setEvolving(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-rose/30 bg-milk sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">
              Evolução de {evolving?.patientName}
            </DialogTitle>
            <DialogDescription>
              Preencha o protocolo de avaliação facial e a conduta deste atendimento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEvolution} className="grid gap-4">
            <ClinicalEvolutionForm value={evolution} onChange={setEvolution} />
            <DialogFooter>
              <Button type="submit" disabled={busyId === evolving?.id}>
                Salvar evolução
              </Button>
            </DialogFooter>
          </form>
          <section className="mt-4 border-t border-rose/30 pt-5">
            <h3 className="font-display text-xl text-ink">Histórico clínico</h3>
            {historyLoading ? (
              <p className="mt-3 text-sm text-inksoft">Carregando histórico...</p>
            ) : history.length === 0 ? (
              <p className="mt-3 text-sm text-inksoft">Nenhuma evolução registrada.</p>
            ) : (
              <div className="mt-4 grid gap-4">
                {history.map((entry) => (
                  <article key={entry.id} className="rounded-lg border border-rose/30 p-4 text-sm">
                    <p className="font-semibold text-rosedeep">
                      {new Date(entry.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <ClinicalEvolutionDetails value={entry} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </DialogContent>
      </Dialog>
    </div>
  );
}
