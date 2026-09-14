import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/page-layout";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços | Dra. Stefany Dias" },
      {
        name: "description",
        content:
          "Conheça os procedimentos de fisioterapia dermatofuncional oferecidos pela Dra. Stefany Dias.",
      },
      { property: "og:title", content: "Serviços | Dra. Stefany Dias" },
      {
        property: "og:description",
        content: "Tratamentos individualizados para pele, corpo e pós-operatório.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});
const items = [
  [
    "Limpeza de pele",
    "Higienização profunda, extração cuidadosa e finalização adequada às necessidades da sua pele.",
  ],
  [
    "Microagulhamento",
    "Estímulo controlado de colágeno indicado para textura, cicatrizes de acne, poros e linhas finas.",
  ],
  ["Peelings", "Renovação gradual da pele com ativos selecionados após avaliação individual."],
  [
    "Drenagem linfática",
    "Manobras suaves para favorecer a circulação linfática, reduzir edemas e trazer leveza.",
  ],
  [
    "Pós-operatório",
    "Acompanhamento dermatofuncional para recuperação, controle de edema e cuidado com cicatrizes.",
  ],
  ["Rejuvenescimento", "Protocolos combinados para firmeza, hidratação, textura e luminosidade."],
];
function Services() {
  return (
    <PageLayout
      eyebrow="Serviços"
      title="Protocolos individualizados, do primeiro cuidado ao resultado."
      intro="A escolha do tratamento acontece após avaliação. Assim, cada etapa respeita a sua pele, seu momento e seus objetivos."
    >
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-xl bg-rose/25 ring-1 ring-rose/25 sm:grid-cols-2">
          {items.map(([title, text], i) => (
            <article key={title} className="bg-milk p-8 sm:p-10">
              <span className="text-xs font-semibold text-rosedeep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 font-display text-2xl">{title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-inksoft">{text}</p>
              <p className="mt-6 text-xs italic text-inksoft">Valor informado após avaliação.</p>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            asChild
            className="rounded-full bg-rosedeep text-primary-foreground hover:bg-rosedeep/90"
          >
            <Link to="/agendamento">
              Agendar avaliação <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
