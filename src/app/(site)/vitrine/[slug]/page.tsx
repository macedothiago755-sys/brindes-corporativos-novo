import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/product-card";
import { VITRINES, getVitrine } from "@/lib/vitrines";

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

  const products = await prisma.product.findMany({
    where: {
      status: "ATIVO",
      ...(vitrine.tag ? { tags: { has: vitrine.tag } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: vitrine.newest ? 24 : undefined,
  });

  return (
    <div className="container-premium py-16">
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
