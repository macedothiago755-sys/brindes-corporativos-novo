import Link from "next/link";
import Image from "next/image";
import { Building2, Factory, HandHeart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { splitCategories, pickFeaturedCategories } from "@/components/site/category-icons";
import { CategoriesGrid } from "@/components/site/categories-grid";

export async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, active: true },
    orderBy: { order: "asc" },
  });
  const { main, rest } = splitCategories(categories);
  const featured = pickFeaturedCategories(categories);

  return (
    <section className="container-premium py-10">
      <CategoriesGrid main={main} rest={rest} featured={featured} all={categories} />
    </section>
  );
}

export function LocalSeoSection() {
  return (
    <section className="border-t border-border bg-muted py-16">
      <div className="container-premium">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">São Paulo</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Brindes corporativos em São Paulo</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A Paint Colors ajuda empresas de São Paulo a criarem brindes personalizados para eventos, clientes,
          parceiros e colaboradores. Atendemos empresas paulistas com agilidade e suporte dedicado para eventos
          corporativos na capital e na região metropolitana.
        </p>
        <Button asChild variant="outline-accent" className="mt-6">
          <Link href="/brindes-corporativos-sao-paulo">Ver brindes para empresas em São Paulo</Link>
        </Button>
      </div>
    </section>
  );
}

export async function SolutionsSection() {
  const solutions = await prisma.solution.findMany({ orderBy: { order: "asc" } });
  if (solutions.length === 0) return null;

  return (
    <section className="border-t border-border bg-muted py-20">
      <div className="container-premium">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Soluções por objetivo</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Empresas não compram apenas produtos. Elas compram soluções.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <Link
              key={s.slug}
              href={`/solucoes/${s.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-muted">
                {s.image && (
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </div>
              <div className="p-5">
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
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
  { step: "01", title: "Escolha ou monte seu kit", desc: "Navegue pelo catálogo ou responda algumas perguntas para montar um kit personalizado." },
  { step: "02", title: "Envie sua logo e aprove a arte", desc: "Compartilhe sua identidade visual e validamos a arte final antes da produção." },
  { step: "03", title: "Produção e entrega", desc: "Produzimos em escala e entregamos no prazo combinado." },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="container-premium py-20">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como funciona</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
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

// Segmentos reais atendidos — usados quando ainda não há logos de clientes
// cadastradas, para não exibir nomes de empresas fictícios.
const fallbackSegments = ["Indústria", "Varejo", "Saúde", "Educação", "Tecnologia", "Serviços"];

export async function ClientsSection() {
  const clients = await prisma.clientLogo.findMany({ orderBy: { order: "asc" } });
  const hasLogos = clients.length > 0;

  return (
    <section id="cases" className="border-t border-border py-16">
      <div className="container-premium">
        <p className="text-center text-sm uppercase tracking-widest text-muted-foreground">
          {hasLogos ? "Empresas que confiam na nossa estrutura" : "Segmentos que atendemos"}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {hasLogos
            ? clients.map((c) => (
                <div key={c.id} className="relative flex h-16 items-center justify-center rounded-md border border-border p-2">
                  <Image src={c.logoUrl} alt={c.name} fill className="object-contain p-2" sizes="200px" />
                </div>
              ))
            : fallbackSegments.map((s) => (
                <div key={s} className="flex h-16 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground">
                  {s}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  // Sem depoimentos reais cadastrados, não exibimos a seção — evita prova
  // social fictícia. Cadastre depoimentos em /admin/conteudo para reativá-la.
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-muted py-20">
      <div className="container-premium">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Depoimentos</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-background p-6">
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
      <Button asChild size="lg" variant="gradient" className="mt-8">
        <Link href="/produtos">Solicitar orçamento</Link>
      </Button>
    </section>
  );
}
