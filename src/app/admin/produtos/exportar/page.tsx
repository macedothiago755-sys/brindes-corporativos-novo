import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

export default async function ExportProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string; status?: string; issue?: string }>;
}) {
  const { q, categoryId, status, issue } = await searchParams;

  const issueWhere =
    issue === "sem-imagem"
      ? { images: { isEmpty: true } }
      : issue === "sem-descricao"
      ? { shortDescription: null }
      : issue === "sem-sku"
      ? { sku: null }
      : issue === "poucas-informacoes"
      ? { benefits: { isEmpty: true }, features: { isEmpty: true } }
      : {};

  const products = await prisma.product.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status: status as "ATIVO" | "RASCUNHO" | "INDISPONIVEL" } : {}),
      ...issueWhere,
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold">Exportar produtos (PDF)</h1>
        <PrintButton />
      </div>

      <h2 className="text-lg font-semibold">Relatório de produtos</h2>
      <p className="text-sm text-muted-foreground">{products.length} produtos · gerado em {new Date().toLocaleDateString("pt-BR")}</p>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-foreground/30 text-left">
            <th className="py-2">Nome</th>
            <th className="py-2">SKU</th>
            <th className="py-2">Categoria</th>
            <th className="py-2">Status</th>
            <th className="py-2">Tags</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-2">{p.name}</td>
              <td className="py-2">{p.sku ?? "—"}</td>
              <td className="py-2">{p.category.name}</td>
              <td className="py-2">{p.status}</td>
              <td className="py-2">{p.tags.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
