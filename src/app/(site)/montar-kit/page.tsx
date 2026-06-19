import type { Metadata } from "next";
import { KitBuilder } from "@/components/site/kit-builder";

export const metadata: Metadata = {
  title: "Montar meu kit personalizado",
  description: "Monte um kit de brindes corporativos sob medida para o seu objetivo, número de pessoas e orçamento.",
};

export default function MontarKitPage() {
  return (
    <div className="container-premium py-16">
      <div className="mb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Montador de kit</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Monte seu kit personalizado</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Responda 3 perguntas rápidas e receba uma sugestão de kit que respeita o seu orçamento por pessoa.
        </p>
      </div>
      <KitBuilder />
    </div>
  );
}
