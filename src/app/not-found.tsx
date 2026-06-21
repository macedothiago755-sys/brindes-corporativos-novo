import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "A página que você procura não existe ou foi movida.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/logo-paint-colors.png" alt="Paint Colors" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Paint Colors</span>
        </Link>

        <p className="mt-10 text-sm font-medium uppercase tracking-widest text-accent">Erro 404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Esta página não foi encontrada
        </h1>
        <p className="mt-4 text-muted-foreground">
          O link pode estar quebrado ou a página foi movida. Volte para o início ou explore nosso catálogo de
          brindes corporativos personalizados.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" variant="gradient">
            <Link href="/">Voltar para o início</Link>
          </Button>
          <Button asChild size="lg" variant="outline-accent">
            <Link href="/produtos">Ver catálogo</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
