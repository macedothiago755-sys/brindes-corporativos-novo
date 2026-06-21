import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/product-card";
import { FilterSidebar } from "@/components/site/filter-sidebar";
import { getCategoryHeading } from "@/lib/category-copy";
import type { CustomizationMethod, ProductObjective } from "@prisma/client";

const objectiveLabels: Record<string, string> = {
  ONBOARDING: "onboarding de colaboradores",
  EVENTO: "eventos corporativos",
  CLIENTE_VIP: "clientes VIP",
  FEIRA: "feiras e exposições",
  PREMIACAO: "ações de premiação",
};

type ProductsSearchParams = { categoria?: string; metodo?: string; tag?: string; objetivo?: string };

function resolveHeading(category: { name: string } | null, objetivo?: string) {
  if (category) return getCategoryHeading(category.name);
  if (objetivo && objectiveLabels[objetivo]) return `Brindes corporativos para ${objectiveLabels[objetivo]}`;
  return "Catálogo de brindes corporativos personalizados";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}): Promise<Metadata> {
  const { categoria, objetivo } = await searchParams;
  const category = categoria ? await prisma.category.findUnique({ where: { slug: categoria } }) : null;
  const title = resolveHeading(category, objetivo);
  return {
    title,
    description: `${title}. Personalize com a marca da sua empresa e receba uma proposta sob medida.`,
  };
}

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const { categoria, metodo, tag, objetivo } = await searchParams;

  const category = categoria
    ? await prisma.category.findUnique({ where: { slug: categoria }, include: { children: true } })
    : null;
  const categoryIds = category
    ? category.children.length
      ? [category.id, ...category.children.map((c) => c.id)]
      : [category.id]
    : undefined;
  const heading = resolveHeading(category, objetivo);

  const [products, topCategories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ATIVO",
        ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
        ...(metodo ? { customizationMethods: { has: metodo as CustomizationMethod } } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(objetivo ? { objectives: { has: objetivo as ProductObjective } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container-premium py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
      <p className="mt-2 text-muted-foreground">
        Navegue pelos produtos, escolha o brinde ideal e solicite um orçamento personalizado para sua empresa.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <FilterSidebar categories={topCategories} />

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
