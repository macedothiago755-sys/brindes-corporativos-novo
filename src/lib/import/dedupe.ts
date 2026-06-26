import { prisma } from "@/lib/prisma";

interface ImportedIdentifiers {
  codigo?: string;
  sku?: string;
}

/**
 * Procura um ImportedProduct já existente do mesmo fornecedor (de uma
 * importação anterior) que corresponda por código ou SKU e que ainda não
 * tenha sido promovido ao catálogo. Usado para atualizar em vez de duplicar
 * quando a mesma categoria é reimportada.
 */
export function findDuplicateImportedProduct(supplierId: string, identifiers: ImportedIdentifiers) {
  const { codigo, sku } = identifiers;
  if (!codigo && !sku) return Promise.resolve(null);

  return prisma.importedProduct.findFirst({
    where: {
      status: { not: "PROMOVIDO" },
      importJob: { supplierId },
      OR: [...(codigo ? [{ codigo }] : []), ...(sku ? [{ sku }] : [])],
    },
    orderBy: { createdAt: "desc" },
  });
}
