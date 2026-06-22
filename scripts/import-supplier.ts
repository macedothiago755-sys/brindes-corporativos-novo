/**
 * Roda a varredura de um fornecedor localmente (precisa de Playwright, que
 * não funciona em funções serverless — por isso não roda direto no admin em
 * produção). Conecta no mesmo banco apontado por DATABASE_URL/DIRECT_URL do
 * seu .env local, então os produtos importados aparecem imediatamente em
 * /admin/importador no site em produção, prontos para revisão e publicação.
 *
 * Uso:
 *   npx tsx scripts/import-supplier.ts <url-da-categoria> [adapterKey] [--supplier="Nome"]
 *
 * Exemplo:
 *   npx tsx scripts/import-supplier.ts "https://www.xbzbrindes.com.br/brindes/Copos" xbz-brindes
 */
import { prisma } from "@/lib/prisma";
import { getAdapter, listAdapters } from "@/scrapers/adapters";
import { startImportJob } from "@/lib/importer";

async function main() {
  const categoryUrl = process.argv[2];
  const adapterKeyArg = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : undefined;
  const supplierNameArg = process.argv.find((a) => a.startsWith("--supplier="))?.split("=")[1];

  if (!categoryUrl) {
    console.error("Uso: npx tsx scripts/import-supplier.ts <url-da-categoria> [adapterKey] [--supplier=\"Nome\"]");
    console.error("Adapters disponíveis:", listAdapters().map((a) => a.key).join(", "));
    process.exit(1);
  }

  let adapterKey = adapterKeyArg;
  if (!adapterKey) {
    const matched = listAdapters().find((a) => a.matchesUrl?.(categoryUrl));
    if (!matched) {
      console.error("Não foi possível detectar o adapter pela URL. Informe explicitamente, ex:");
      console.error(`  npx tsx scripts/import-supplier.ts "${categoryUrl}" xbz-brindes`);
      console.error("Adapters disponíveis:", listAdapters().map((a) => a.key).join(", "));
      process.exit(1);
    }
    adapterKey = matched.key;
  }

  const adapter = getAdapter(adapterKey);
  if (!adapter) {
    console.error(`Adapter "${adapterKey}" não existe. Disponíveis:`, listAdapters().map((a) => a.key).join(", "));
    process.exit(1);
  }

  let supplier = await prisma.supplier.findFirst({ where: { adapterKey } });
  if (!supplier) {
    const name = supplierNameArg || adapter.name;
    supplier = await prisma.supplier.create({
      data: { name, baseUrl: new URL(categoryUrl).origin, adapterKey },
    });
    console.log(`Fornecedor "${name}" criado.`);
  }

  const job = await prisma.importJob.create({
    data: { supplierId: supplier.id, categoryUrl, status: "PENDENTE" },
  });

  console.log(`Job ${job.id} criado para ${supplier.name}. Varrendo "${categoryUrl}"...`);
  await startImportJob(job.id);

  const finalJob = await prisma.importJob.findUnique({ where: { id: job.id } });
  console.log("Concluído:", {
    status: finalJob?.status,
    encontrados: finalJob?.productsFound,
    importados: finalJob?.productsImported,
    jaCadastrados: finalJob?.productsSkipped,
    comErro: finalJob?.productsFailed,
  });
  console.log(`Revise em: /admin/importador/${job.id}`);
}

main()
  .catch((err) => {
    console.error("Falha na importação:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
