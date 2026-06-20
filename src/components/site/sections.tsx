import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Briefcase,
  ChefHat,
  Coffee,
  Crown,
  Cpu,
  CupSoda,
  Dumbbell,
  Factory,
  Flame,
  Frame,
  HandHeart,
  Leaf,
  Package,
  PartyPopper,
  PawPrint,
  Shirt,
  ShieldCheck,
  ShoppingBag,
  Sofa,
  Tag,
  ToyBrick,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const categoryIcons: Record<string, LucideIcon> = {
  brinquedos: ToyBrick,
  canecas: Coffee,
  "casa e decoracao": Sofa,
  copos: CupSoda,
  escritorio: Briefcase,
  espelhos: Frame,
  esporte: Dumbbell,
  eventos: PartyPopper,
  "kit churrasco": Flame,
  "kits corporativos": Package,
  "linha pet": PawPrint,
  "moda e estilo": Shirt,
  petisqueiras: UtensilsCrossed,
  plaquinhas: Tag,
  premium: Crown,
  "sacolas e sacochilas": ShoppingBag,
  sustentaveis: Leaf,
  tecnologia: Cpu,
  tabuas: ChefHat,
  utilidades: Wrench,
};

function normalizeCategoryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function getCategoryIcon(name: string): LucideIcon {
  return categoryIcons[normalizeCategoryName(name)] ?? Package;
}

export async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  return (
    <section className="container-premium py-20">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categorias principais</h2>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.name);
          return (
            <Link
              key={c.slug}
              href={`/produtos?categoria=${c.slug}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-3 py-6 text-center transition-colors hover:border-accent hover:bg-accent/5"
            >
              <Icon
                className="h-8 w-8 text-foreground transition-colors group-hover:text-accent"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          );
        })}
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
  { step: "01", title: "Escolha seus produtos", desc: "Navegue pelo catálogo ou monte um kit personalizado para seu objetivo." },
  { step: "02", title: "Envie sua identidade visual", desc: "Compartilhe logotipo e diretrizes de marca para a personalização." },
  { step: "03", title: "Aprovação da arte", desc: "Validamos a arte final com você antes de iniciar a produção." },
  { step: "04", title: "Produção e entrega", desc: "Produzimos em escala e entregamos no prazo combinado." },
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

const fallbackClients = ["Empresa A", "Empresa B", "Empresa C", "Empresa D", "Empresa E", "Empresa F"];

export async function ClientsSection() {
  const clients = await prisma.clientLogo.findMany({ orderBy: { order: "asc" } });

  return (
    <section className="border-t border-border py-16">
      <div className="container-premium">
        <p className="text-center text-sm uppercase tracking-widest text-muted-foreground">
          Empresas que confiam na nossa estrutura
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {clients.length > 0
            ? clients.map((c) => (
                <div key={c.id} className="relative flex h-16 items-center justify-center rounded-md border border-border p-2">
                  <Image src={c.logoUrl} alt={c.name} fill className="object-contain p-2" sizes="200px" />
                </div>
              ))
            : fallbackClients.map((c) => (
                <div key={c} className="flex h-16 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground">
                  {c}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

const fallbackTestimonials = [
  { id: "1", quote: "O processo de orçamento foi rápido e o atendimento muito próximo. Os brindes chegaram impecáveis.", name: "Diretora de Marketing", company: "Grupo Industrial" },
  { id: "2", quote: "Conseguimos personalizar exatamente como precisávamos para o evento institucional.", name: "Gerente de RH", company: "Holding Corporativa" },
  { id: "3", quote: "Qualidade muito acima do que esperávamos para um brinde corporativo.", name: "Coordenador de Eventos", company: "Rede Nacional" },
];

export async function TestimonialsSection() {
  const dbTestimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;

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
