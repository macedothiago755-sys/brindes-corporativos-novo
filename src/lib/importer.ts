import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/scrapers/adapters";
import { enhanceDescription } from "@/scrapers/enhance-description";
import { findDuplicateImportedProduct } from "@/lib/import/dedupe";
import { buildProductDraft } from "@/lib/import/product-mapper";

/**
 * Dispara a varredura de uma categoria do fornecedor em background.
 * Não é aguardado pelo caller — o job vai sendo atualizado no banco
 * conforme os produtos são processados, e a UI faz polling do status.
 *
 * Observação para produção: em ambientes serverless (ex: Vercel) uma função
 * não roda indefinidamente em background após responder a requisição. Para
 * produção real, mover esta chamada para um worker dedicado (fila/cron) que
 * roda em um processo Node persistente — ver `src/lib/import/queue.ts`.
 */
export async function startImportJob(jobId: string) {
  const job = await prisma.importJob.findUnique({ where: { id: jobId }, include: { supplier: true } });
  if (!job) return;

  const adapter = getAdapter(job.supplier.adapterKey);
  if (!adapter) {
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: "FALHOU" },
    });
    await prisma.importError.create({
      data: { importJobId: jobId, motivo: `Adapter "${job.supplier.adapterKey}" não encontrado em /scrapers/adapters.` },
    });
    return;
  }

  await prisma.importJob.update({
    where: { id: jobId },
    data: { status: "EM_EXECUCAO", startedAt: new Date() },
  });

  // Import dinâmico: o motor de scraping usa Playwright (navegador real),
  // que não roda em funções serverless. Mantendo-o fora do import estático
  // deste arquivo, as outras rotas que usam `importer.ts` (ex: promover/
  // melhorar produto importado) não carregam o Playwright sem necessidade.
  const { createScrapeProvider } = await import("@/lib/import/provider");
  const provider = createScrapeProvider(adapter);

  try {
    await provider.run({
      categoryUrl: job.categoryUrl,
      onProgress: async (found) => {
        await prisma.importJob.update({ where: { id: jobId }, data: { productsFound: found } });
      },
      onProductScraped: async (product) => {
        // Produto já promovido ao catálogo (cadastrado/ajustado pelo admin):
        // não recria na fila de revisão nem sobrescreve dados já editados.
        const alreadyRegistered = product.codigo
          ? await prisma.product.findFirst({ where: { supplierCode: product.codigo } })
          : null;

        if (alreadyRegistered) {
          await prisma.importJob.update({
            where: { id: jobId },
            data: { productsSkipped: { increment: 1 } },
          });
          return;
        }

        const duplicate = await findDuplicateImportedProduct(job.supplierId, {
          codigo: product.codigo,
          sku: product.sku,
        });

        const data = {
          importJobId: jobId,
          sourceUrl: product.sourceUrl,
          nome: product.nome,
          codigo: product.codigo,
          sku: product.sku,
          marca: product.marca,
          categoria: product.categoria,
          descricaoCurta: product.descricaoCurta,
          descricaoLonga: product.descricaoLonga,
          preco: product.preco,
          imagemPrincipal: product.imagemPrincipal,
          imagens: product.imagens,
          dadosTecnicos: product.dadosTecnicos,
          status: "IMPORTADO" as const,
        };

        if (duplicate) {
          await prisma.importedProduct.update({ where: { id: duplicate.id }, data });
        } else {
          await prisma.importedProduct.create({ data });
        }

        await prisma.importJob.update({
          where: { id: jobId },
          data: { productsImported: { increment: 1 } },
        });
      },
      onProductError: async (error) => {
        await prisma.importError.create({
          data: {
            importJobId: jobId,
            sourceUrl: error.sourceUrl,
            produto: error.produto,
            motivo: error.motivo,
          },
        });
        await prisma.importJob.update({
          where: { id: jobId },
          data: { productsFailed: { increment: 1 } },
        });
      },
    });

    const finalJob = await prisma.importJob.findUnique({ where: { id: jobId } });
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: finalJob && finalJob.productsFailed > 0 ? "CONCLUIDO_COM_ERROS" : "CONCLUIDO",
        finishedAt: new Date(),
      },
    });
  } catch (err) {
    await prisma.importError.create({
      data: { importJobId: jobId, motivo: err instanceof Error ? err.message : "Falha desconhecida no crawler" },
    });
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: "FALHOU", finishedAt: new Date() },
    });
  }
}

export async function enhanceImportedProductDescription(productId: string) {
  const product = await prisma.importedProduct.findUnique({ where: { id: productId } });
  if (!product) return;

  const descricaoIA = await enhanceDescription({
    nome: product.nome,
    descricaoCurta: product.descricaoCurta ?? undefined,
    descricaoLonga: product.descricaoLonga ?? undefined,
    dadosTecnicos: (product.dadosTecnicos as Record<string, string>) ?? {},
  });

  await prisma.importedProduct.update({ where: { id: productId }, data: { descricaoIA } });
}

/** Promove um produto importado para o catálogo interno (Product). Nasce como rascunho — requer revisão humana antes de publicar. */
export async function promoteImportedProduct(productId: string, categoryId: string) {
  const product = await prisma.importedProduct.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produto importado não encontrado.");

  const draft = await buildProductDraft(product, categoryId);
  const created = await prisma.product.create({ data: draft });

  await prisma.importedProduct.update({
    where: { id: productId },
    data: { status: "PROMOVIDO", promotedProductId: created.id },
  });

  return created;
}
