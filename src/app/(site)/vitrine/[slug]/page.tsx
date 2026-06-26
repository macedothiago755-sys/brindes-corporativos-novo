import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVitrineProducts } from "@/lib/cached-queries";
import { ProductCard } from "@/components/site/product-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { VITRINES, getVitrine } from "@/lib/vitrines";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return VITRINES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vitrine = getVitrine(slug);
  if (!vitrine) return {};
  return {
    title: vitrine.title,
    description: vitrine.description,
    alternates: { canonical: `/vitrine/${vitrine.slug}` },
  };
}

export default async function VitrinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vitrine = getVitrine(slug);
  if (!vitrine) notFound();

  const products = await getVitrineProducts(vitrine.tag, vitrine.newest ? 24 : undefined);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: vitrine.title,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/produto/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="container-premium py-16">
      {products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      <Breadcrumbs
        items={[
          { name: "Início", href: "/" },
          { name: "Produtos", href: "/produtos" },
          { name: vitrine.title, href: `/vitrine/${vitrine.slug}` },
        ]}
      />

      <h1 className="text-3xl font-semibold tracking-tight">{vitrine.title}</h1>
      <p className="mt-2 text-muted-foreground">{vitrine.description}</p>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            Nenhum produto disponível nesta vitrine no momento.
          </p>
        )}
      </div>
    </div>
  );
}
