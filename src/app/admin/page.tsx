import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    novos,
    emAnalise,
    totalQuotes,
    fechados,
    totalProdutos,
    produtosAtivos,
    produtosRascunho,
    produtosIndisponiveis,
    produtosSemImagem,
    totalCategorias,
    topRequested,
    topViewed,
  ] = await Promise.all([
    prisma.quote.count({ where: { status: "NOVO" } }),
    prisma.quote.count({ where: { status: "EM_ANALISE" } }),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "FECHADO" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "ATIVO" } }),
    prisma.product.count({ where: { status: "RASCUNHO" } }),
    prisma.product.count({ where: { status: "INDISPONIVEL" } }),
    prisma.product.count({ where: { images: { isEmpty: true } } }),
    prisma.category.count(),
    prisma.quoteItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
    prisma.productView.groupBy({
      by: ["productId"],
      where: { createdAt: { gte: since } },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
  ]);

  const productIds = [
    ...new Set([...topRequested.map((p) => p.productId), ...topViewed.map((p) => p.productId)]),
  ];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true } })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));

  const conversao = totalQuotes > 0 ? Math.round((fechados / totalQuotes) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">Orçamentos</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/orcamentos?status=NOVO">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Novos orçamentos</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{novos}</CardContent>
          </Card>
        </Link>
        <Link href="/admin/orcamentos?status=EM_ANALISE">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Em análise</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{emAnalise}</CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader><CardTitle>Conversão</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{conversao}%</CardContent>
        </Card>
        <Link href="/admin/orcamentos">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Total de orçamentos</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{totalQuotes}</CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="mt-10 text-sm font-medium uppercase tracking-wide text-muted-foreground">Catálogo</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/produtos">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Total de produtos</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{totalProdutos}</CardContent>
          </Card>
        </Link>
        <Link href="/admin/produtos?status=ATIVO">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Produtos ativos</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">
              {produtosAtivos}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                de {totalProdutos}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/produtos?status=RASCUNHO">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Rascunhos</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">
              {produtosRascunho}
              {produtosIndisponiveis > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  · {produtosIndisponiveis} indisp.
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/categorias">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{totalCategorias}</CardContent>
          </Card>
        </Link>
      </div>

      {produtosSemImagem > 0 && (
        <div className="mt-4">
          <Link
            href="/admin/produtos?issue=sem-imagem"
            className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 hover:bg-amber-100"
          >
            ⚠ {produtosSemImagem} produto(s) sem imagem — revisar no catálogo
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Produtos mais solicitados</h2>
          <ul className="mt-4 space-y-2">
            {topRequested.map((tp) => {
              const product = productById.get(tp.productId);
              return (
                <li key={tp.productId} className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm">
                  <span>{product?.name ?? "Produto removido"}</span>
                  <span className="font-medium">{tp._count.productId} solicitações</span>
                </li>
              );
            })}
            {topRequested.length === 0 && (
              <p className="text-sm text-muted-foreground">Ainda não há dados suficientes.</p>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Produtos mais acessados (30 dias)</h2>
          <ul className="mt-4 space-y-2">
            {topViewed.map((tp) => {
              const product = productById.get(tp.productId);
              return (
                <li key={tp.productId} className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm">
                  {product ? (
                    <Link href={`/produto/${product.slug}`} className="hover:underline" target="_blank">
                      {product.name}
                    </Link>
                  ) : (
                    <span>Produto removido</span>
                  )}
                  <span className="font-medium">{tp._count.productId} visitas</span>
                </li>
              );
            })}
            {topViewed.length === 0 && (
              <p className="text-sm text-muted-foreground">Ainda não há acessos registrados no período.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
