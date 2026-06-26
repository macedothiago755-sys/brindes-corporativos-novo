import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getTopProductsByViews() {
  const grouped = await prisma.productView.groupBy({
    by: ["productId"],
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 10,
  });
  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true, slug: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return grouped.map((g) => ({ product: byId.get(g.productId), count: g._count.productId })).filter((g) => g.product);
}

async function getTopProductsByQuoteCount() {
  const grouped = await prisma.quoteItem.groupBy({
    by: ["productId"],
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 10,
  });
  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true, slug: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return grouped.map((g) => ({ product: byId.get(g.productId), count: g._count.productId })).filter((g) => g.product);
}

async function getTopProductsByQuantity() {
  const grouped = await prisma.quoteItem.groupBy({
    by: ["productId"],
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: "desc" } },
    take: 10,
  });
  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true, slug: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return grouped
    .map((g) => ({ product: byId.get(g.productId), count: g._sum.quantidade ?? 0 }))
    .filter((g) => g.product);
}

async function getTopCategoriesByViews() {
  const views = await prisma.productView.findMany({
    select: { product: { select: { category: { select: { id: true, name: true } } } } },
  });
  const counts = new Map<string, { name: string; count: number }>();
  for (const v of views) {
    const cat = v.product.category;
    const entry = counts.get(cat.id) ?? { name: cat.name, count: 0 };
    entry.count += 1;
    counts.set(cat.id, entry);
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function RankList({ items }: { items: { product?: { name: string; slug: string }; count: number }[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;
  }
  return (
    <ol className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex items-center justify-between gap-3">
          <Link href={`/produto/${item.product?.slug}`} className="truncate hover:underline" target="_blank">
            {i + 1}. {item.product?.name}
          </Link>
          <span className="font-medium text-muted-foreground">{item.count}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function AnalyticsPage() {
  const [mostViewed, mostRequested, mostQuantity, topCategories] = await Promise.all([
    getTopProductsByViews(),
    getTopProductsByQuoteCount(),
    getTopProductsByQuantity(),
    getTopCategoriesByViews(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Analytics do catálogo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Métricas baseadas em visualizações de página de produto e itens de orçamento recebidos.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos mais vistos</CardTitle>
          </CardHeader>
          <CardContent>
            <RankList items={mostViewed} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos mais solicitados (orçamentos)</CardTitle>
          </CardHeader>
          <CardContent>
            <RankList items={mostRequested} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos com maior quantidade solicitada</CardTitle>
          </CardHeader>
          <CardContent>
            <RankList items={mostQuantity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias mais procuradas</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {topCategories.map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between gap-3">
                    <span className="truncate">{i + 1}. {c.name}</span>
                    <span className="font-medium text-muted-foreground">{c.count}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
