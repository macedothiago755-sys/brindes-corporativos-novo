"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Observabilidade: registra no console e reporta ao Sentry (no-op sem DSN).
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Algo deu errado</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-4 text-muted-foreground">
          Tivemos um problema inesperado. Você pode tentar novamente ou voltar para o início.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="gradient" onClick={() => reset()}>
            Tentar novamente
          </Button>
          <Button asChild size="lg" variant="outline-accent">
            <Link href="/">Voltar para o início</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
