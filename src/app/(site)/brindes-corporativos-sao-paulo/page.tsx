import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Gift, PartyPopper, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/site/faq-section";
import { brindesSaoPauloFaq } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "Brindes Corporativos em São Paulo | Kits Personalizados para Empresas",
  description:
    "Empresa de brindes corporativos em São Paulo. Kits personalizados para eventos, clientes e onboarding, com atendimento na capital e região metropolitana.",
};

const items = [
  {
    icon: Building2,
    title: "Brindes para empresas",
    desc: "Produtos personalizados com a marca da sua empresa para presentear parceiros e colaboradores.",
    href: "/produtos",
  },
  {
    icon: PartyPopper,
    title: "Kits para eventos corporativos",
    desc: "Soluções completas para feiras, congressos e ativações de marca em São Paulo.",
    href: "/produtos?objetivo=EVENTO",
  },
  {
    icon: Gift,
    title: "Presentes corporativos para clientes",
    desc: "Brindes premium para fortalecer o relacionamento com clientes VIP.",
    href: "/produtos?objetivo=CLIENTE_VIP",
  },
  {
    icon: Users,
    title: "Kits onboarding",
    desc: "Kits de boas-vindas personalizados para novos colaboradores.",
    href: "/produtos?objetivo=ONBOARDING",
  },
  {
    icon: Sparkles,
    title: "Ações de marca",
    desc: "Brindes promocionais para campanhas e ações de premiação da sua empresa.",
    href: "/produtos?objetivo=PREMIACAO",
  },
];

export default function BrindesCorporativosSaoPauloPage() {
  return (
    <>
      <section className="container-premium py-16 sm:py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">São Paulo</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Brindes corporativos personalizados em São Paulo
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A Paint Colors é uma empresa especializada em brindes corporativos personalizados para empresas em São
          Paulo, oferecendo kits personalizados, produtos promocionais e soluções para eventos corporativos.
        </p>
        <Button asChild size="lg" variant="gradient" className="mt-8">
          <Link href="/montar-kit">Montar meu kit personalizado</Link>
        </Button>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent hover:bg-accent/5"
            >
              <item.icon className="h-7 w-7 text-accent" strokeWidth={1.75} />
              <p className="mt-4 font-medium">{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted py-16">
        <div className="container-premium">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Atendimento em toda a capital e região metropolitana
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Atendemos empresas paulistas com agilidade e suporte dedicado para eventos corporativos, ações de marca
            e presentes institucionais — na capital, na região metropolitana de São Paulo e em todo o Brasil.
          </p>
          <Button asChild variant="outline-accent" className="mt-6">
            <Link href="/produtos">Ver catálogo completo</Link>
          </Button>
        </div>
      </section>

      <FaqSection items={brindesSaoPauloFaq} id="faq-sao-paulo" />
    </>
  );
}
