import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, MapPin, MessageCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/page-layout";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Dra. Stefany Dias" },
      { name: "description", content: "Entre em contato com a Dra. Stefany Dias em Vitória/ES." },
      { property: "og:title", content: "Contato | Dra. Stefany Dias" },
      { property: "og:description", content: "Agende seu atendimento em Vitória, Espírito Santo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});
type Contact = [LucideIcon, string, string, string | null];

const contacts: Contact[] = [
  [
    MapPin,
    "Localização",
    "Praia do Suá · 3º andar sala 302",
    "https://maps.app.goo.gl/EKackJ81JG2gZdC6A?g_st=iw",
  ],
  [
    Instagram,
    "Instagram",
    "@stefanyfisiodermato",
    "https://www.instagram.com/stefanyfisiodermato/",
  ],
  [MessageCircle, "WhatsApp", "Atendimento por mensagem", null],
];

const phoneNumber = "5527988333769";

function Contact() {
  return (
    <PageLayout
      eyebrow="Contato"
      title="Vamos conversar sobre o cuidado ideal para você?"
      intro="Atendimentos em Vitória, Espírito Santo. Escolha o canal que preferir."
    >
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {contacts.map(([Icon, title, text, href]) => {
            const className =
              "rounded-xl border border-rose/30 bg-milk p-7 text-center hover:border-rosedeep/50 hover:bg-mist/50 transition-all duration-300";
            const content = (
              <>
                <Icon className="mx-auto size-6 text-rosedeep" />
                <h2 className="mt-4 font-display text-xl">{title}</h2>
                <p className="mt-2 text-sm text-inksoft">{text}</p>
              </>
            );
            return href ? (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <div key={title} className={className}>
                {content}
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            className="rounded-full bg-rosedeep text-primary-foreground hover:bg-rosedeep/90"
          >
            <Link to="/agendamento">Agendar online</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-rose/50">
            <a
              href={`https://wa.me/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent("Olá, Dra. Stefany! Gostaria de agendar uma avaliação.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
