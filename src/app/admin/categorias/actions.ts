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

// Sugestões de subcategorias por categoria-pai, definidas junto com o time de
// catálogo. Casamento de "categoria pai" é por nome (case/acento-insensível);
// subcategorias já existentes (mesmo nome) são ignoradas — ação idempotente.
const SUGGESTED_SUBCATEGORIES: Record<string, string[]> = {
  "Blocos e Cadernetos": ["Cadernetos Eco", "Blocos de Anotações", "Moleskines e Agendas"],
  "Bolsas Térmicas": ["Marmiteiras", "Mochilas Térmicas", "Sacolas Térmicas"],
  Canecas: ["Canecas de Cerâmica/Porcelana", "Canecas de Inox/Térmicas", "Canecas de Plástico/Acrílico"],
  Canetas: ["Canetas Plásticas", "Canetas Metal/Executivas", "Canetas Ecológicas"],
  Chaveiros: ["Chaveiros de Metal", "Chaveiros de Couro", "Chaveiros Multifunção (Abridores, Fitas, etc.)"],
  "Conjuntos Executivos": ["Kits de Escrita (Caneta/Lapiseira)", "Kit de Couro (Carteira/Chaveiro)", "Kit de Vinho"],
  Cozinha: ["Tábuas e Utensílios", "Copos e Taças", "Abridores e Acessórios de Bar"],
  "Cuidados Pessoais": ["Kits de Higiene/Manicure", "Espelhos e Escovas", "Bem-estar e Relaxamento"],
  Escritório: ["Organizadores de Mesa", "Pastas e Pastas Convenção", "Réguas e Risque-Rabisque"],
  Esportes: ["Toalhas Fitness", "Braçadeiras e Pochetes", "Acessórios para Lazer/Praia"],
  Ferramentas: ["Lanternas", "Kits de Ferramentas Automotivas", "Trenas e Canivetes Multifunção"],
  "Guarda-Chuva": ["Guarda-Chuva Retrátil (Bolsa)", "Guarda-Chuva Longo (Portaria)", "Sombrinhas"],
  Informática: ["Mouse Pads", "Power Banks e Carregadores", "Pen Drives e Hubs", "Caixas de Som/Fones"],
  "Kit Churrasco": ["Kits em Estojos", "Facas e Chairas Isoladas"],
  "Kit Queijo": ["Jogos com Tábua e Facas"],
  "Linha Pet": ["Comedouros e Bebedouros", "Coleiras e Guias", "Acessórios e Brinquedos"],
  "Mochilas e Bolsas": ["Mochilas para Notebook", "Mochilas de Viagem/Malas", "Pastas Executivas"],
  Necessaires: ["Necessaires de Tecido/Nylon", "Necessaires de Couro/Sintético", "Necessaires Transparentes/PVC"],
  "Sacolas e Sacochilas": ["Sacochilas (Cordão)", "Ecobags/Sacolas de Algodão", "Sacolas de TNT/Nylon"],
  "Squeezes e Garrafas": ["Squeezes Plásticos", "Garrafas de Inox/Alumínio", "Garrafas Térmicas"],
};

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export async function seedSuggestedSubcategories() {
  await requirePermission();

  const categories = await prisma.category.findMany({ where: { parentId: null } });
  const byNormalizedName = new Map(categories.map((c) => [normalizeName(c.name), c]));

  const existingChildren = await prisma.category.findMany({
    where: { parentId: { in: categories.map((c) => c.id) } },
    select: { name: true, parentId: true },
  });
  const existingKey = (parentId: string, name: string) => `${parentId}::${normalizeName(name)}`;
  const existing = new Set(existingChildren.map((c) => existingKey(c.parentId!, c.name)));

  let created = 0;
  for (const [parentName, subNames] of Object.entries(SUGGESTED_SUBCATEGORIES)) {
    const parent = byNormalizedName.get(normalizeName(parentName));
    if (!parent) continue;

    for (const subName of subNames) {
      if (existing.has(existingKey(parent.id, subName))) continue;

      const baseSlug = slugify(subName);
      let slug = baseSlug;
      let suffix = 1;
      while (await prisma.category.findUnique({ where: { slug } })) {
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }

      await prisma.category.create({ data: { name: subName, slug, parentId: parent.id } });
      created++;
    }
  }

  revalidatePath("/admin/categorias");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidateTag(CACHE_TAGS.categories, "max");

  return created;
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
