"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="border-b border-border bg-muted">
      <div className="container-premium grid items-center gap-12 py-24 lg:grid-cols-2 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            Brindes corporativos premium
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Brindes personalizados que fortalecem marcas
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Produtos corporativos personalizados para empresas que querem criar experiências
            memoráveis.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/produtos">Solicitar orçamento</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/produtos">Ver catálogo</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="aspect-square w-full rounded-2xl bg-gradient-to-br from-foreground/5 via-accent/10 to-foreground/10"
        />
      </div>
    </section>
  );
}
