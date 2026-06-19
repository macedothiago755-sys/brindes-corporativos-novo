"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const microInfo = ["Orçamento rápido", "Produção personalizada", "Atendimento especializado"];

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
            Brindes corporativos que transformam marcas em experiências
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Personalizamos produtos que aproximam empresas, clientes e equipes.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
            {microInfo.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="gradient">
              <Link href="/produtos">Montar meu kit personalizado</Link>
            </Button>
            <Button asChild size="lg" variant="outline-accent">
              <Link href="/produtos">Ver catálogo</Link>
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
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl lg:aspect-[5/4]"
        >
          <Image
            src="/banners/banner-6-churrasco-1920x600.jpg"
            alt="Kit corporativo personalizado com a marca do cliente"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
