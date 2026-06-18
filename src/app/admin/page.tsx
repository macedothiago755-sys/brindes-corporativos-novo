import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [novos, emAnalise, total, fechados, topProducts] = await Promise.all([
    prisma.quote.count({ where: { status: "NOVO" } }),
    prisma.quote.count({ where: { status: "EM_ANALISE" } }),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "FECHADO" } }),
    prisma.quoteItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
  ]);

  const products = await prisma.product.findMany({
    where: { id: { in: topProducts.map((p) => p.productId) } },
  });

  const conversao = total > 0 ? Math.round((fechados / total) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Novos orçamentos</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{novos}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Em análise</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{emAnalise}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Conversão</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{conversao}%</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total de orçamentos</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{total}</CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Produtos mais solicitados</h2>
        <ul className="mt-4 space-y-2">
          {topProducts.map((tp) => {
            const product = products.find((p) => p.id === tp.productId);
            return (
              <li key={tp.productId} className="flex justify-between rounded-md border border-border px-4 py-3 text-sm">
                <span>{product?.name ?? "Produto removido"}</span>
                <span className="font-medium">{tp._count.productId} solicitações</span>
              </li>
            );
          })}
          {topProducts.length === 0 && <p className="text-sm text-muted-foreground">Ainda não há dados suficientes.</p>}
        </ul>
      </div>
    </div>
  );
}
