import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { enhanceImportedProductDescription, promoteImportedProduct } from "@/lib/importer";
import { Button } from "@/components/ui/button";
import { AutoRefresh } from "@/components/admin/auto-refresh";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_EXECUCAO: "Em execução",
  CONCLUIDO: "Concluído",
  CONCLUIDO_COM_ERROS: "Concluído com erros",
  FALHOU: "Falhou",
};

export default async function ImportJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [job, categories] = await Promise.all([
    prisma.importJob.findUnique({
      where: { id },
      include: {
        supplier: true,
        products: { orderBy: { createdAt: "asc" } },
        errors: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!job) return notFound();

  const running = job.status === "PENDENTE" || job.status === "EM_EXECUCAO";

  async function enhance(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId"));
    await enhanceImportedProductDescription(productId);
    revalidatePath(`/admin/importador/${id}`);
  }

  async function promote(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId"));
    const categoryId = String(formData.get("categoryId"));
    if (!categoryId) return;
    await promoteImportedProduct(productId, categoryId);
    revalidatePath(`/admin/importador/${id}`);
  }

  return (
    <div>
      {running && <AutoRefresh />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.supplier.name}</h1>
          <a href={job.categoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
            {job.categoryUrl}
          </a>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
          {statusLabel[job.status] ?? job.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Encontrados</p>
          <p className="mt-1 text-xl font-semibold">{job.productsFound}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Importados</p>
          <p className="mt-1 text-xl font-semibold text-success">{job.productsImported}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Erros</p>
          <p className="mt-1 text-xl font-semibold text-destructive">{job.productsFailed}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={`/api/admin/importer/export/${id}?format=csv`}>
          <Button variant="outline" size="sm">Exportar CSV</Button>
        </a>
        <a href={`/api/admin/importer/export/${id}?format=xlsx`}>
          <Button variant="outline" size="sm">Exportar Excel</Button>
        </a>
        <a href={`/api/admin/importer/export/${id}?format=json`}>
          <Button variant="outline" size="sm">Exportar JSON</Button>
        </a>
      </div>

      <div className="mt-10 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {job.products.map((product) => (
              <tr key={product.id} className="border-t border-border align-top">
                <td className="px-4 py-3 font-medium">
                  <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {product.nome}
                  </a>
                </td>
                <td className="px-4 py-3">{product.codigo || "—"}</td>
                <td className="max-w-[320px] px-4 py-3 text-muted-foreground">
                  {product.descricaoIA ? (
                    <span className="text-foreground">{product.descricaoIA}</span>
                  ) : (
                    product.descricaoCurta || product.descricaoLonga || "—"
                  )}
                </td>
                <td className="px-4 py-3">{product.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {!product.descricaoIA && (
                      <form action={enhance}>
                        <input type="hidden" name="productId" value={product.id} />
                        <Button type="submit" variant="outline" size="sm">Melhorar descrição</Button>
                      </form>
                    )}
                    {product.status !== "PROMOVIDO" && (
                      <form action={promote} className="flex items-center gap-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <select
                          name="categoryId"
                          required
                          className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                        >
                          <option value="">Categoria...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <Button type="submit" size="sm">Promover</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {job.products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {running ? "Varredura em andamento..." : "Nenhum produto importado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {job.errors.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold">Erros de importação</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {job.errors.map((error) => (
                  <tr key={error.id} className="border-t border-border">
                    <td className="max-w-[280px] truncate px-4 py-3">{error.sourceUrl || "—"}</td>
                    <td className="px-4 py-3 text-destructive">{error.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
