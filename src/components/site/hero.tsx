import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroMockCard } from "@/components/site/hero-mock-card";

const bullets = ["Sem catálogo confuso", "Sugestões automáticas por orçamento", "Personalização em tempo real"];

export function Hero() {
  return (
    <section className="border-b border-border bg-muted">
      <div className="container-premium grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-accent">
            <ShieldCheck className="h-4 w-4" />
            Especialistas em soluções corporativas personalizadas
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Crie brindes corporativos personalizados em menos de 1 minuto
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Responda algumas perguntas rápidas e receba sugestões prontas + orçamento automático.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="gradient">
              <Link href="/montar-kit">Montar meu kit</Link>
            </Button>
            <Button asChild size="lg" variant="outline-accent">
              <Link href="/produtos">Ver catálogo completo</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Receba uma proposta personalizada em até <span className="font-medium text-foreground">1 hora útil</span>
            {" · "}equipe comercial disponível para auxiliar sua escolha.
          </p>
        </div>

        <HeroMockCard />
      </div>
    </section>
  );
}
