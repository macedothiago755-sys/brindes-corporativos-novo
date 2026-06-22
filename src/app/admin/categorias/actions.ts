"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CACHE_TAGS } from "@/lib/cached-queries";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requirePermission() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "categories:edit")) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}

export async function createCategory(formData: FormData) {
  await requirePermission();

  const name = String(formData.get("name") || "").trim();
  const parentId = String(formData.get("parentId") || "").trim() || null;
  if (!name) return;

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.category.create({ data: { name, slug, parentId } });
  revalidatePath("/admin/categorias");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requirePermission();

  const name = String(formData.get("name") || "").trim();
  const parentId = String(formData.get("parentId") || "").trim() || null;
  if (!name || parentId === categoryId) return;

  const orderRaw = formData.get("order");
  const order = orderRaw !== null && String(orderRaw).trim() !== "" ? Number(orderRaw) : undefined;
  const metaTitle = String(formData.get("metaTitle") || "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") || "").trim() || null;

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      parentId,
      ...(order !== undefined && !Number.isNaN(order) ? { order } : {}),
      metaTitle,
      metaDescription,
    },
  });
  revalidatePath("/admin/categorias");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
}

export async function toggleCategoryActive(formData: FormData) {
  await requirePermission();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const category = await prisma.category.findUnique({ where: { id }, select: { active: true } });
  if (!category) return;

  await prisma.category.update({ where: { id }, data: { active: !category.active } });
  revalidatePath("/admin/categorias");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
}

export async function deleteCategory(formData: FormData) {
  await requirePermission();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);

  if (childCount > 0 || productCount > 0) {
    throw new Error("Não é possível excluir uma categoria com subcategorias ou produtos vinculados.");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
}
