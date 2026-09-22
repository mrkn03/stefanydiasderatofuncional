import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { login } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso profissional | Dra. Stefany Dias" },
      { name: "description", content: "Área privada para gestão dos agendamentos." },
      { property: "og:title", content: "Acesso profissional | Dra. Stefany Dias" },
      { property: "og:description", content: "Área privada para gestão dos agendamentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});
function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    try {
      await login(String(f.get("email")), String(f.get("password")));
      await navigate({ to: "/admin" });
    } catch {
      toast.error("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-milk text-ink">
      <SiteHeader />
      <main className="mx-auto flex max-w-md px-5 py-20">
        <form onSubmit={submit} className="edge w-full rounded-2xl bg-milk p-8 ring-1 ring-rose/30">
          <LockKeyhole className="size-7 text-rosedeep" />
          <h1 className="mt-5 font-display text-3xl">Acesso profissional</h1>
          <p className="mt-3 text-sm text-inksoft">
            Entre para gerenciar os agendamentos recebidos.
          </p>
          <div className="mt-8">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required className="mt-2" />
          </div>
          <div className="mt-5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required className="mt-2" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-full bg-rosedeep text-primary-foreground hover:bg-rosedeep/90"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </main>
    </div>
  );
}
