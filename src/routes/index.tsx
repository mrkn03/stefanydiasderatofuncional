import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import heroAsset from "@/assets/stefany-hero.jpg.asset.json";
import portraitAsset from "@/assets/stefany-sobre.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dra. Stefany Dias | Fisioterapia Dermatofuncional" },
    { name: "description", content: "Tratamentos de pele e corpo com ciência e cuidado individualizado em Vitória/ES. Agende sua avaliação com a Dra. Stefany Dias." },
    { property: "og:title", content: "Dra. Stefany Dias | Fisioterapia Dermatofuncional" },
    { property: "og:description", content: "Ciência, cuidado e resultados que respeitam você. Agende sua avaliação." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Home,
});

const services = [
  ["01", "Limpeza de pele", "Cuidado profundo para desobstruir, equilibrar e renovar o aspecto da pele."],
  ["02", "Microagulhamento", "Estímulo de colágeno para textura, cicatrizes de acne, poros e linhas finas."],
  ["03", "Peelings", "Renovação gradual e segura para uniformizar textura, viço e tonalidade."],
  ["04", "Drenagem linfática", "Técnica suave para reduzir edemas, favorecer a circulação e proporcionar leveza."],
  ["05", "Pós-operatório", "Acompanhamento especializado para uma recuperação mais segura e confortável."],
  ["06", "Rejuvenescimento", "Protocolos individualizados para estimular firmeza, hidratação e luminosidade."],
];

function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-milk font-body text-ink">
      <SiteHeader />
      <main>
        <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rosedeep">Fisioterapia dermatofuncional · Vitória/ES</p>
              <h1 className="mt-6 max-w-[17ch] text-balance font-display text-5xl font-normal leading-[1.03] sm:text-6xl lg:text-7xl">Sua pele merece <span className="italic text-rosedeep">ciência</span>, escuta e cuidado.</h1>
              <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-inksoft sm:text-lg">Tratamentos individualizados que unem evidência científica, saúde e beleza para resultados naturais e seguros.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-rosedeep px-6 text-primary-foreground hover:bg-rosedeep/90"><Link to="/agendamento">Agendar avaliação <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-rose/50 bg-milk/70"><Link to="/servicos">Conhecer tratamentos</Link></Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-inksoft"><span className="flex items-center gap-2"><GraduationCap className="size-4 text-rosedeep" />Formada pela UFES</span><span className="flex items-center gap-2"><Sparkles className="size-4 text-rosedeep" />Pós em Dermatofuncional</span></div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="stripes absolute -inset-4 -z-10 rounded-2xl opacity-70" />
              <img src={heroAsset.url} alt="Dra. Stefany Dias, fisioterapeuta" width={719} height={1305} className="aspect-[4/5] w-full rounded-xl object-cover object-[center_25%] shadow-2xl" />
              <div className="edge absolute -bottom-5 -left-3 rounded-xl bg-milk/90 px-5 py-4 backdrop-blur-xl sm:-left-7"><p className="text-[10px] uppercase tracking-[0.22em] text-rosedeep">Atendimento</p><p className="mt-1 font-display text-base">Praia do Suá · Vitória</p></div>
            </div>
          </div>
        </section>

        <section className="bg-mist/55 px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rosedeep">Tratamentos</p><h2 className="mt-4 max-w-xl font-display text-3xl font-normal sm:text-4xl">Cuidado pensado para cada fase da sua pele.</h2></div><Link to="/servicos" className="flex items-center gap-2 text-sm font-semibold text-rosedeep">Ver todos <ArrowRight className="size-4" /></Link></div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl bg-rose/25 ring-1 ring-rose/25 sm:grid-cols-2 lg:grid-cols-3">{services.map(([n,title,text]) => <article key={n} className="bg-milk p-7"><span className="text-[11px] font-semibold text-rosedeep">{n}</span><h3 className="mt-4 font-display text-xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-inksoft">{text}</p></article>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5"><img src={portraitAsset.url} alt="Retrato da Dra. Stefany Dias" loading="lazy" width={779} height={777} className="aspect-square w-full rounded-xl object-cover" /></div>
            <div className="lg:col-span-7 lg:pl-8"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rosedeep">Sobre</p><h2 className="mt-4 text-balance font-display text-3xl sm:text-4xl">Conhecimento técnico com um olhar verdadeiramente humano.</h2><p className="mt-6 max-w-xl text-base leading-relaxed text-inksoft">Sou Stefany Dias, fisioterapeuta formada pela Universidade Federal do Espírito Santo e finalizando a pós-graduação em Fisioterapia Dermatofuncional. Acredito em um cuidado que respeita a individualidade, a saúde e os objetivos de cada pessoa.</p><div className="mt-8 flex gap-3"><Heart className="mt-0.5 size-5 shrink-0 text-rosedeep" /><p className="max-w-md text-sm leading-relaxed text-inksoft">Cada protocolo começa com avaliação e conversa, para que você se sinta segura em todas as etapas.</p></div><Button asChild variant="outline" className="mt-8 rounded-full border-rose/50"><Link to="/sobre">Conhecer minha trajetória</Link></Button></div>
          </div>
        </section>

        <section className="stripes-soft px-5 py-20 sm:px-6"><div className="edge mx-auto max-w-4xl rounded-2xl bg-milk/90 p-9 text-center backdrop-blur sm:p-14"><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rosedeep">Seu momento de cuidado</p><h2 className="mt-5 font-display text-3xl sm:text-5xl">Vamos começar com uma avaliação?</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-inksoft sm:text-base">Escolha o procedimento, a data e o melhor horário. Se preferir, também pode falar diretamente pelo WhatsApp.</p><Button asChild size="lg" className="mt-8 rounded-full bg-rosedeep px-7 text-primary-foreground hover:bg-rosedeep/90"><Link to="/agendamento">Agendar agora <ArrowRight /></Link></Button></div></section>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}