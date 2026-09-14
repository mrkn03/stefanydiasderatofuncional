import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { WhatsAppFloat } from "./whatsapp-float";

export function PageLayout({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-milk font-body text-ink">
      <SiteHeader />
      <main>
        <section className="stripes-soft border-b border-rose/20 px-5 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rosedeep">{eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-normal leading-tight sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-inksoft sm:text-lg">{intro}</p>
          </div>
        </section>
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}