import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/product-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";

async function getSolution(slug: string) {
  return prisma.solution.findUnique({
    where: { slug },
    include: {
      products: { include: { product: { include: { category: true } } } },
      kits: { where: { active: true }, include: { items: { include: { product: true } } } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = await prisma.solution.findUnique({ where: { slug } });
  if (!solution) return {};
  return {
    title: solution.title,
    description: solution.description,
    alternates: { canonical: `/solucoes/${solution.slug}` },
    openGraph: {
      title: solution.title,
      description: solution.description,
      ...(solution.image ? { images: [solution.image] } : {}),
    },
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = await getSolution(slug);

  if (!solution) notFound();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: solution.title,
    numberOfItems: solution.products.length,
    itemListElement: solution.products.slice(0, 30).map(({ product }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/produto/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="container-premium py-16">
      {solution.products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      <Breadcrumbs
        items={[
          { name: "Início", href: "/" },
          { name: "Soluções", href: "/produtos" },
          { name: solution.title, href: `/solucoes/${solution.slug}` },
        ]}
      />

      <p className="text-sm font-medium uppercase tracking-widest text-accent">Solução por objetivo</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{solution.title}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{solution.description}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg" variant="gradient">
          <Link href="/montar-kit">Montar meu kit personalizado</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/produtos">{solution.ctaLabel || "Solicitar orçamento"}</Link>
        </Button>
      </div>

      {solution.products.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Produtos relacionados</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {solution.products.map(({ product }) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}

      {solution.kits.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Sugestões de kits</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solution.kits.map((kit) => (
              <div key={kit.id} className="rounded-xl border border-border bg-card p-5">
                <p className="font-medium">{kit.name}</p>
                {kit.description && <p className="mt-1 text-sm text-muted-foreground">{kit.description}</p>}
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {kit.items.map((item) => (
                    <li key={item.id}>
                      {item.quantityPerPerson}x {item.product.name}
                    </li>
                  ))}
                </ul>
                {kit.estimatedPricePerPerson && (
                  <p className="mt-3 text-sm font-medium">
                    A partir de R$ {kit.estimatedPricePerPerson.toFixed(2)} / pessoa
                  </p>
                )}
                <Button asChild size="sm" className="mt-4">
                  <Link href="/montar-kit">Solicitar orçamento deste kit</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
