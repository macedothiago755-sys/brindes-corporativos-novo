import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { matchCategory } from "@/lib/import/category-matcher";
import { Button } from "@/components/ui/button";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { ImportedProductsTable } from "@/components/admin/imported-products-table";
import {
  enhanceImportedProduct,
  promoteImported,
  promoteImportedBulk,
  ignoreImportedProduct,
  restoreImportedProduct,
  updateImportedProduct,
} from "./actions";

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

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "importer:run")) redirect("/admin");

  const [job, categories] = await Promise.all([
    prisma.importJob.findUnique({
      where: { id },
      include: {
        supplier: true,
        requestedBy: true,
        products: { orderBy: { createdAt: "asc" } },
        errors: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!job) return notFound();

  const running = job.status === "PENDENTE" || job.status === "EM_EXECUCAO";

  return (
    <div>
      {running && <AutoRefresh />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{job.supplier.name}</h1>
          <a href={job.categoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
            {job.categoryUrl}
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            Importado em {job.createdAt.toLocaleString("pt-BR")}
            {job.requestedBy && <> por {job.requestedBy.name}</>}
          </p>
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

      <div className="mt-10">
        <ImportedProductsTable
          products={job.products.map((product) => ({
            ...product,
            suggestedCategoryId: matchCategory(product.categoria, categories)?.id,
          }))}
          categories={categories}
          emptyState={running ? "Varredura em andamento..." : "Nenhum produto importado."}
          enhanceAction={enhanceImportedProduct}
          promoteAction={promoteImported}
          ignoreAction={ignoreImportedProduct}
          restoreAction={restoreImportedProduct}
          updateAction={updateImportedProduct}
          bulkPromoteAction={promoteImportedBulk}
        />
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
