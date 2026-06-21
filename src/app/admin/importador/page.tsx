import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listAdapters } from "@/scrapers/adapters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

/**
 * O motor de varredura usa Playwright (navegador real), que precisa de
 * binários que não são incluídos no bundle de funções serverless da Vercel.
 * Por isso essa funcionalidade fica desativada em produção/preview na Vercel
 * — funciona normalmente em ambiente local (`npm run dev`).
 */
const isImporterDisabled = process.env.VERCEL === "1";

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_EXECUCAO: "Em execução",
  CONCLUIDO: "Concluído",
  CONCLUIDO_COM_ERROS: "Concluído com erros",
  FALHOU: "Falhou",
};

export default async function ImporterPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "importer:run")) redirect("/admin");

  const [jobs, suppliers] = await Promise.all([
    prisma.importJob.findMany({
      include: { supplier: true, requestedBy: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  const adapters = listAdapters();

  const totals = jobs.reduce(
    (acc, job) => {
      acc.found += job.productsFound;
      acc.imported += job.productsImported;
      acc.skipped += job.productsSkipped;
      acc.failed += job.productsFailed;
      return acc;
    },
    { found: 0, imported: 0, skipped: 0, failed: 0 }
  );
  const lastSync = jobs.find((j) => j.finishedAt)?.finishedAt;

  async function startImport(formData: FormData) {
    "use server";

    const actionSession = await auth();
    const actionRole = (actionSession?.user as { role?: string } | undefined)?.role;
    if (!can(actionRole, "importer:run")) {
      throw new Error("Você não tem permissão para executar esta ação.");
    }
    if (isImporterDisabled) {
      throw new Error("O importador automático está desativado neste ambiente. Rode-o localmente (npm run dev).");
    }
    const requestedById = (actionSession?.user as { id?: string } | undefined)?.id;

    const categoryUrl = String(formData.get("categoryUrl") || "").trim();
    const adapterKey = String(formData.get("adapterKey") || "").trim();
    let supplierId = String(formData.get("supplierId") || "").trim();
    const newSupplierName = String(formData.get("newSupplierName") || "").trim();

    if (!categoryUrl || !adapterKey) return;

    if (!supplierId && newSupplierName) {
      const baseUrl = new URL(categoryUrl).origin;
      const supplier = await prisma.supplier.create({
        data: { name: newSupplierName, baseUrl, adapterKey },
      });
      supplierId = supplier.id;
    }

    if (!supplierId) return;

    const job = await prisma.importJob.create({
      data: { supplierId, categoryUrl, status: "PENDENTE", requestedById },
    });

    // Disparo em background — não bloqueia a resposta da página.
    // Import dinâmico: evita que o motor de scraping (Playwright) entre no
    // bundle desta rota quando o importador está desativado (ver acima).
    const { enqueueImportJob } = await import("@/lib/import/queue");
    enqueueImportJob(job.id);

    redirect(`/admin/importador/${job.id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Importador de produtos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Importe catálogos de fornecedores sem CSV/API via varredura automática de páginas de categoria.
      </p>

      {isImporterDisabled && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          A varredura automática de fornecedores está desativada neste ambiente, pois depende de um navegador
          (Playwright) que não roda em funções serverless. Use o cadastro manual de produtos, ou rode o
          importador localmente (<code>npm run dev</code>) e cadastre os resultados aqui depois.
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Produtos encontrados</p>
          <p className="mt-1 text-2xl font-semibold">{totals.found}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Produtos importados</p>
          <p className="mt-1 text-2xl font-semibold text-success">{totals.imported}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Já cadastrados</p>
          <p className="mt-1 text-2xl font-semibold">{totals.skipped}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Erros</p>
          <p className="mt-1 text-2xl font-semibold text-destructive">{totals.failed}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Última sincronização</p>
          <p className="mt-1 text-sm font-medium">
            {lastSync ? new Date(lastSync).toLocaleString("pt-BR") : "—"}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Encontrados</th>
                <th className="px-4 py-3">Importados</th>
                <th className="px-4 py-3">Já cadastrados</th>
                <th className="px-4 py-3">Erros</th>
                <th className="px-4 py-3">Solicitado por</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-4 py-3">{job.supplier.name}</td>
                  <td className="max-w-[220px] truncate px-4 py-3">
                    <a href={job.categoryUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {job.categoryUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3">{statusLabel[job.status] ?? job.status}</td>
                  <td className="px-4 py-3">{job.productsFound}</td>
                  <td className="px-4 py-3">{job.productsImported}</td>
                  <td className="px-4 py-3">{job.productsSkipped}</td>
                  <td className="px-4 py-3">{job.productsFailed}</td>
                  <td className="px-4 py-3">{job.requestedBy?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/importador/${job.id}`} className="text-sm font-medium text-accent hover:underline">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma importação iniciada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isImporterDisabled ? (
          <div className="space-y-2 rounded-xl border border-border p-6">
            <p className="font-semibold">Nova importação</p>
            <p className="text-sm text-muted-foreground">
              Indisponível neste ambiente. Rode o importador localmente (<code>npm run dev</code>) e cadastre os
              produtos encontrados manualmente, ou pelo painel de produtos.
            </p>
          </div>
        ) : (
        <form action={startImport} className="space-y-4 rounded-xl border border-border p-6">
          <p className="font-semibold">Nova importação</p>

          <div>
            <Label htmlFor="categoryUrl">URL da categoria</Label>
            <Input
              id="categoryUrl"
              name="categoryUrl"
              type="url"
              placeholder="https://fornecedor.com/categoria/canecas"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="adapterKey">Adapter (estrutura do site)</Label>
            <select
              id="adapterKey"
              name="adapterKey"
              required
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {adapters.map((adapter) => (
                <option key={adapter.key} value={adapter.key}>
                  {adapter.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Cada fornecedor precisa de um adapter em <code>/src/scrapers/adapters</code> mapeando os seletores do site.
            </p>
          </div>

          <div>
            <Label htmlFor="supplierId">Fornecedor existente</Label>
            <select
              id="supplierId"
              name="supplierId"
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">— Criar novo fornecedor —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="newSupplierName">Nome do novo fornecedor</Label>
            <Input id="newSupplierName" name="newSupplierName" placeholder="Ex: Fornecedor ABC Brindes" className="mt-2" />
          </div>

          <Button type="submit" className="w-full">
            Iniciar varredura
          </Button>
        </form>
        )}
      </div>
    </div>
  );
}
