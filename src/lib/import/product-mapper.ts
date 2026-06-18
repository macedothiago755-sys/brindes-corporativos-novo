import type { ImportedProduct } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/scrapers/utils/clean";

async function uniqueSlugFor(name: string): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++attempt}`;
  }
  return slug;
}

/** Evita violar a constraint @unique de Product.sku quando o SKU já pertence a outro produto. */
async function safeSkuFor(sku: string | null | undefined): Promise<string | undefined> {
  if (!sku) return undefined;
  const existing = await prisma.product.findUnique({ where: { sku } });
  return existing ? undefined : sku;
}

/**
 * Monta os dados de criação de um Product a partir de um ImportedProduct
 * revisado pelo admin. O produto nasce sempre como RASCUNHO — campos
 * comerciais (preço, prazo, estoque) ficam para preenchimento manual.
 */
export async function buildProductDraft(product: ImportedProduct, categoryId: string) {
  const dados = (product.dadosTecnicos as Record<string, string>) ?? {};
  const imagens = (product.imagens as string[]) ?? [];

  const [slug, sku] = await Promise.all([uniqueSlugFor(product.nome), safeSkuFor(product.sku)]);

  return {
    name: product.nome,
    slug,
    sku,
    supplierCode: product.codigo ?? undefined,
    brand: product.marca ?? undefined,
    status: "RASCUNHO" as const,
    description: product.descricaoIA || product.descricaoLonga || product.descricaoCurta || product.nome,
    shortDescription: product.descricaoCurta ?? undefined,
    features: Object.entries(dados).map(([k, v]) => `${k}: ${v}`),
    materials: dados.material ? [dados.material] : [],
    colors: dados.cor ? [dados.cor] : [],
    idealFor: [],
    customizationMethods: [],
    images: imagens.length ? imagens : product.imagemPrincipal ? [product.imagemPrincipal] : [],
    dimensions: dados.dimensao,
    categoryId,
  };
}
