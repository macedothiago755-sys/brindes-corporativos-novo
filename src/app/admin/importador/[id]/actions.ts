"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { enhanceImportedProductDescription, promoteImportedProduct } from "@/lib/importer";

async function requirePermission() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "importer:run")) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}

export async function enhanceImportedProduct(productId: string) {
  await requirePermission();
  await enhanceImportedProductDescription(productId);
  revalidatePath("/admin/importador/[id]", "page");
}

export async function promoteImported(productId: string, formData: FormData) {
  await requirePermission();
  const categoryId = String(formData.get("categoryId") || "").trim();
  if (!categoryId) return;
  await promoteImportedProduct(productId, categoryId);
  revalidatePath("/admin/importador/[id]", "page");
}

export async function promoteImportedBulk(formData: FormData) {
  await requirePermission();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const ids = formData.getAll("productId").map(String).filter(Boolean);
  if (!categoryId || ids.length === 0) return;

  for (const id of ids) {
    await promoteImportedProduct(id, categoryId);
  }

  revalidatePath("/admin/importador/[id]", "page");
}

export async function ignoreImportedProduct(productId: string) {
  await requirePermission();
  await prisma.importedProduct.update({ where: { id: productId }, data: { status: "IGNORADO" } });
  revalidatePath("/admin/importador/[id]", "page");
}

export async function restoreImportedProduct(productId: string) {
  await requirePermission();
  await prisma.importedProduct.update({ where: { id: productId }, data: { status: "IMPORTADO" } });
  revalidatePath("/admin/importador/[id]", "page");
}

export async function updateImportedProduct(productId: string, formData: FormData) {
  await requirePermission();

  const preco = String(formData.get("preco") || "").trim();

  await prisma.importedProduct.update({
    where: { id: productId },
    data: {
      nome: String(formData.get("nome") || "").trim(),
      codigo: String(formData.get("codigo") || "").trim() || null,
      sku: String(formData.get("sku") || "").trim() || null,
      marca: String(formData.get("marca") || "").trim() || null,
      categoria: String(formData.get("categoria") || "").trim() || null,
      descricaoCurta: String(formData.get("descricaoCurta") || "").trim() || null,
      preco: preco ? Number(preco.replace(",", ".")) : null,
    },
  });

  revalidatePath("/admin/importador/[id]", "page");
}
