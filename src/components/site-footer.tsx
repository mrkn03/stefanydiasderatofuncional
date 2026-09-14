import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-6">
      <div className="rounded-2xl bg-ink px-7 py-8 text-milk sm:px-10">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xl">Dra. Stefany Dias</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-milk/70">Fisioterapia dermatofuncional com ciência, escuta e cuidado individualizado.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs text-milk/75">
            <Link to="/servicos" className="hover:text-milk">Serviços</Link>
            <Link to="/sobre" className="hover:text-milk">Sobre</Link>
            <Link to="/agendamento" className="hover:text-milk">Agendar</Link>
            <Link to="/contato" className="hover:text-milk">Contato</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-milk/15 pt-5 text-[11px] text-milk/50">© 2026 Dra. Stefany Dias · Vitória, Espírito Santo</div>
      </div>
    </footer>
  );
}