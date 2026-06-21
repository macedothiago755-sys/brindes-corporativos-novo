"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const bullets = ["Sem catálogo confuso", "Sugestões automáticas por orçamento", "Personalização em tempo real"];

const mockObjectives = ["Clientes", "Funcionários", "Eventos"];

export function Hero() {
  return (
    <section className="border-b border-border bg-muted">
      <div className="container-premium grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative w-full"
        >
          <Link
            href="/montar-kit"
            className="group block rounded-2xl border border-border bg-card p-6 shadow-xl transition-shadow hover:shadow-2xl sm:p-8"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Bot className="h-5 w-5" />
              Monte seu brinde
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Me diga o que você precisa e eu monto o kit ideal pra você.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">1. Qual o objetivo?</p>
                <div className="mt-2 flex gap-2">
                  {mockObjectives.map((o, i) => (
                    <span
                      key={o}
                      className={
                        i === 0
                          ? "rounded-md border border-accent bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent"
                          : "rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">2. Quantas unidades?</p>
                <div className="mt-2 h-9 w-32 rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium">
                  1.000
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">3. Orçamento por unidade?</p>
                <div className="mt-2 h-9 w-32 rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium">
                  R$ 25
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 rounded-md bg-gradient-brand px-4 py-3 text-sm font-semibold text-white transition-transform group-hover:scale-[1.02]">
              <Sparkles className="h-4 w-4" />
              Gerar sugestões automáticas
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
