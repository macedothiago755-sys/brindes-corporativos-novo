import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/product-card";
import { FilterSidebar } from "@/components/site/filter-sidebar";
import type { CustomizationMethod } from "@prisma/client";

export const metadata: Metadata = {
  title: "Catálogo de Brindes Corporativos",
  description: "Explore nosso catálogo de brindes corporativos personalizados e solicite um orçamento sob medida.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; metodo?: string }>;
}) {
  const { categoria, metodo } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      ...(categoria ? { category: { slug: categoria } } : {}),
      ...(metodo ? { customizationMethods: { has: metodo as CustomizationMethod } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-premium py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Catálogo de produtos</h1>
      <p className="mt-2 text-muted-foreground">
        Navegue pelos produtos, escolha o brinde ideal e solicite um orçamento personalizado.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <FilterSidebar />

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              Nenhum produto encontrado para os filtros selecionados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
