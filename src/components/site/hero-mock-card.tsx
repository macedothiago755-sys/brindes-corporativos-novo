"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

const mockObjectives = ["Clientes", "Funcionários", "Eventos"];

export function HeroMockCard() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.1 }}
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
  );
}
