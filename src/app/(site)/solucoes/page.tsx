import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSolutionsList } from "@/lib/cached-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Soluções por objetivo | Paint Colors Company",
  description:
    "Encontre o brinde corporativo ideal para cada objetivo: RH, clientes, eventos, kits, sustentabilidade e linha premium.",
  alternates: { canonical: "/solucoes" },
};

export default async function SolucoesPage() {
  const solutions = await getSolutionsList();

  return (
    <div className="container-premium py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">Soluções por objetivo</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Empresas não compram apenas produtos. Elas compram soluções.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Escolha a solução que melhor representa o seu objetivo e veja os brindes corporativos selecionados para essa
        ocasião.
      </p>

      {solutions.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Nenhuma solução disponível no momento.</p>
      ) : (
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
      )}
    </div>
  );
}
