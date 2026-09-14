import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    ["/servicos", "Serviços"], ["/sobre", "Sobre"], ["/resultados", "Resultados"], ["/contato", "Contato"],
  ] as const;
  return (
    <header className="relative z-30 mx-auto max-w-6xl px-5 pt-6 sm:px-6 sm:pt-8">
      <div className="edge flex items-center justify-between rounded-2xl bg-milk/80 px-5 py-4 backdrop-blur-xl ring-1 ring-rose/30">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-medium text-ink">Dra. Stefany Dias</span>
          <span className="hidden text-[10px] uppercase tracking-[0.24em] text-inksoft sm:block">dermatofuncional</span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs font-medium text-inksoft lg:flex">
          {links.map(([to, label]) => <Link key={to} to={to} className="transition-colors hover:text-rosedeep">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="rounded-full bg-rosedeep text-primary-foreground hover:bg-rosedeep/90">
            <Link to="/agendamento">Agendar</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(!open)}><Menu /></Button>
        </div>
      </div>
      {open && <nav className="edge mt-2 grid gap-1 rounded-2xl bg-milk p-3 ring-1 ring-rose/30 lg:hidden">{links.map(([to,label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-inksoft hover:bg-mist">{label}</Link>)}</nav>}
    </header>
  );
}