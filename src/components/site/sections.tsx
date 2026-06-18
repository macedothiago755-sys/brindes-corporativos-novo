import Link from "next/link";
import { Building2, Factory, HandHeart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Escritório", slug: "escritorio" },
  { name: "Tecnologia", slug: "tecnologia" },
  { name: "Utilidades", slug: "utilidades" },
  { name: "Eventos", slug: "eventos" },
  { name: "Kits Corporativos", slug: "kits-corporativos" },
  { name: "Sustentáveis", slug: "sustentaveis" },
  { name: "Premium", slug: "premium" },
];

export function CategoriesSection() {
  return (
    <section className="container-premium py-20">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categorias principais</h2>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/produtos?categoria=${c.slug}`}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-muted text-center text-sm font-medium transition-colors hover:border-accent"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

const differentiators = [
  { icon: Factory, title: "Escala industrial", desc: "Estrutura preparada para grandes volumes e prazos apertados." },
  { icon: ShieldCheck, title: "Qualidade garantida", desc: "Controle rigoroso em cada etapa da produção e personalização." },
  { icon: HandHeart, title: "Atendimento dedicado", desc: "Time comercial especializado acompanha cada projeto." },
  { icon: Building2, title: "Marca premium", desc: "Experiência de compra pensada para empresas exigentes." },
];

export function DifferentiatorsSection() {
  return (
    <section id="diferenciais" className="border-y border-border bg-muted py-20">
      <div className="container-premium">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Diferenciais</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {differentiators.map((d) => (
            <div key={d.title}>
              <d.icon className="h-8 w-8 text-accent" />
              <p className="mt-4 font-medium">{d.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { step: "01", title: "Escolha o produto", desc: "Navegue pelo catálogo inteligente e selecione o brinde ideal." },
  { step: "02", title: "Configure os detalhes", desc: "Informe quantidade, cores e tipo de personalização desejada." },
  { step: "03", title: "Solicite o orçamento", desc: "Envie sua solicitação com poucos cliques, sem complicação." },
  { step: "04", title: "Fale com nosso time", desc: "Nossa equipe comercial entra em contato com a proposta ideal." },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="container-premium py-20">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como funciona</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.step}>
            <p className="text-3xl font-semibold text-accent">{s.step}</p>
            <p className="mt-3 font-medium">{s.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClientsSection() {
  const clients = ["Empresa A", "Empresa B", "Empresa C", "Empresa D", "Empresa E", "Empresa F"];
  return (
    <section className="border-t border-border py-16">
      <div className="container-premium">
        <p className="text-center text-sm uppercase tracking-widest text-muted-foreground">
          Empresas que confiam na nossa estrutura
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {clients.map((c) => (
            <div key={c} className="flex h-16 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { quote: "O processo de orçamento foi rápido e o atendimento muito próximo. Os brindes chegaram impecáveis.", name: "Diretora de Marketing", company: "Grupo Industrial" },
  { quote: "Conseguimos personalizar exatamente como precisávamos para o evento institucional.", name: "Gerente de RH", company: "Holding Corporativa" },
  { quote: "Qualidade muito acima do que esperávamos para um brinde corporativo.", name: "Coordenador de Eventos", company: "Rede Nacional" },
];

export function TestimonialsSection() {
  return (
    <section className="bg-muted py-20">
      <div className="container-premium">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Depoimentos</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="container-premium py-24 text-center">
      <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Pronto para criar experiências memoráveis para sua empresa?
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
        Fale com nosso time comercial e receba uma proposta personalizada para o seu projeto.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/produtos">Solicitar orçamento</Link>
      </Button>
    </section>
  );
}
