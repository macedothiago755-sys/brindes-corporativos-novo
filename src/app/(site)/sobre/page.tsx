import type { Metadata } from "next";
import Link from "next/link";
import { Factory, ShieldCheck, HandHeart, Palette, MapPin, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/site/faq-section";
import type { FaqItem } from "@/components/site/faq-section";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import {
  SITE_NAME,
  CONTACT_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  BUSINESS_HOURS_DISPLAY,
  BUSINESS_ADDRESS,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Sobre a Paint Colors | Brindes Corporativos Personalizados em São Paulo",
  description:
    "Conheça a Paint Colors: empresa especializada em brindes corporativos personalizados em São Paulo. Veja como trabalhamos, nossa estrutura de produção e os segmentos que atendemos.",
  alternates: { canonical: "/sobre" },
};

const processo = [
  {
    icon: Palette,
    title: "Escolha e personalização",
    desc: "Você seleciona produtos no catálogo ou monta um kit por objetivo, e define como a sua marca será aplicada.",
  },
  {
    icon: ShieldCheck,
    title: "Aprovação da arte",
    desc: "Enviamos a arte final para a sua validação. Nada vai para produção sem a sua aprovação — sem surpresas.",
  },
  {
    icon: Factory,
    title: "Produção em escala",
    desc: "Produzimos com controle de qualidade em cada etapa, preparados para grandes volumes e prazos de evento.",
  },
  {
    icon: HandHeart,
    title: "Entrega acompanhada",
    desc: "Entregamos no prazo combinado, em São Paulo e em todo o Brasil, com atendimento dedicado do início ao fim.",
  },
];

const metodos = [
  "Gravação a laser",
  "Silk screen",
  "Bordado",
  "Impressão UV",
  "Transfer",
];

const segmentos = ["Indústria", "Varejo", "Saúde", "Educação", "Tecnologia", "Serviços", "Eventos", "Agências"];

const sobreFaq: FaqItem[] = [
  {
    question: "A Paint Colors é uma empresa de brindes corporativos de São Paulo?",
    answer:
      "Sim. Somos uma empresa especializada em brindes corporativos personalizados, com atendimento na cidade de São Paulo (Av. Brigadeiro Faria Lima) e envio para todo o Brasil.",
  },
  {
    question: "Qual o prazo para produzir brindes personalizados?",
    answer:
      "O prazo depende do produto, da quantidade e do tipo de personalização. Após a aprovação da arte, informamos um prazo de produção e entrega para o seu projeto — e priorizamos datas de eventos.",
  },
  {
    question: "Vocês atendem pedidos de grande volume?",
    answer:
      "Sim. Nossa estrutura é preparada para grandes volumes e prazos de evento, com controle de qualidade em cada etapa da produção e da personalização.",
  },
];

export default function SobrePage() {
  return (
    <>
      <section className="container-premium py-16 sm:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Sobre", href: "/sobre" }]} />
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Sobre nós</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Especialistas em brindes corporativos personalizados em São Paulo
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A {SITE_NAME} ajuda empresas a transformarem a sua marca em brindes que criam relacionamento. Unimos um
          catálogo amplo, personalização sob medida e atendimento próximo para que cada projeto — de kits de
          onboarding a presentes para clientes VIP — seja entregue com qualidade e no prazo.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild size="lg" variant="gradient">
            <Link href="/montar-kit">Montar meu kit</Link>
          </Button>
          <Button asChild size="lg" variant="outline-accent">
            <Link href="/produtos">Ver catálogo completo</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-muted py-16 sm:py-20">
        <div className="container-premium">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como trabalhamos</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Um processo simples e transparente, pensado para reduzir o risco de quem compra brindes para a empresa.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processo.map((p) => (
              <div key={p.title}>
                <p.icon className="h-8 w-8 text-accent" strokeWidth={1.75} />
                <p className="mt-4 font-medium">{p.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-premium py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Estrutura e personalização</h2>
            <p className="mt-4 text-muted-foreground">
              Trabalhamos com diferentes técnicas de personalização, escolhidas conforme o material de cada produto
              para garantir o melhor acabamento para a sua marca.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {metodos.map((m) => (
                <li key={m} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground/80">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Segmentos que atendemos</h2>
            <p className="mt-4 text-muted-foreground">
              Atendemos empresas de diversos setores, de pequenos pedidos a grandes ações corporativas.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
              {segmentos.map((s) => (
                <li key={s} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted py-16 sm:py-20">
        <div className="container-premium">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Atendimento e localização</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <address className="not-italic text-sm text-muted-foreground">
                {BUSINESS_ADDRESS.street}
                <br />
                {BUSINESS_ADDRESS.locality} – {BUSINESS_ADDRESS.region}
                <br />
                CEP {BUSINESS_ADDRESS.postalCode}
              </address>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <a href={`tel:${BUSINESS_PHONE_E164}`} className="text-sm text-muted-foreground hover:text-foreground">
                {BUSINESS_PHONE_DISPLAY}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-muted-foreground hover:text-foreground">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm text-muted-foreground">{BUSINESS_HOURS_DISPLAY}</p>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={sobreFaq} id="faq-sobre" title="Perguntas frequentes sobre a empresa" />
    </>
  );
}
