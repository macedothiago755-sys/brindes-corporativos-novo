import { prisma } from "@/lib/prisma";
import { runCrawl } from "@/scrapers/engine";
import { getAdapter } from "@/scrapers/adapters";
import { slugify } from "@/scrapers/utils/clean";
import { enhanceDescription } from "@/scrapers/enhance-description";

/**
 * Dispara a varredura de uma categoria do fornecedor em background.
 * Não é aguardado pelo caller — o job vai sendo atualizado no banco
 * conforme os produtos são processados, e a UI faz polling do status.
 *
 * Observação para produção: em ambientes serverless (ex: Vercel) uma função
 * não roda indefinidamente em background após responder a requisição. Para
 * produção real, mover esta chamada para um worker dedicado (fila/cron) que
 * roda em um processo Node persistente.
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

  try {
    await runCrawl({
      categoryUrl: job.categoryUrl,
      adapter,
      onProgress: async (found) => {
        await prisma.importJob.update({ where: { id: jobId }, data: { productsFound: found } });
      },
      onProductScraped: async (product) => {
        await prisma.importedProduct.create({
          data: {
            importJobId: jobId,
            sourceUrl: product.sourceUrl,
            nome: product.nome,
            codigo: product.codigo,
            sku: product.sku,
            marca: product.marca,
            categoria: product.categoria,
            descricaoCurta: product.descricaoCurta,
            descricaoLonga: product.descricaoLonga,
            imagemPrincipal: product.imagemPrincipal,
            imagens: product.imagens,
            dadosTecnicos: product.dadosTecnicos,
            status: "IMPORTADO",
          },
        });
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

/** Promove um produto importado para o catálogo interno (Product). Requer revisão humana antes de publicar. */
export async function promoteImportedProduct(productId: string, categoryId: string) {
  const product = await prisma.importedProduct.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produto importado não encontrado.");

  const baseSlug = slugify(product.nome);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++attempt}`;
  }

  const dados = (product.dadosTecnicos as Record<string, string>) ?? {};
  const imagens = (product.imagens as string[]) ?? [];

  const created = await prisma.product.create({
    data: {
      name: product.nome,
      slug,
      description: product.descricaoIA || product.descricaoLonga || product.descricaoCurta || product.nome,
      features: Object.entries(dados).map(([k, v]) => `${k}: ${v}`),
      materials: dados.material ? [dados.material] : [],
      colors: dados.cor ? [dados.cor] : [],
      idealFor: [],
      customizationMethods: [],
      images: imagens.length ? imagens : product.imagemPrincipal ? [product.imagemPrincipal] : [],
      dimensions: dados.dimensao,
      categoryId,
    },
  });

  await prisma.importedProduct.update({
    where: { id: productId },
    data: { status: "PROMOVIDO", promotedProductId: created.id },
  });

  return created;
}
