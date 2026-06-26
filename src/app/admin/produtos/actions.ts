"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { productSchema } from "@/lib/validations";
import { enhanceDescription } from "@/scrapers/enhance-description";
import { CACHE_TAGS } from "@/lib/cached-queries";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requirePermission(permission: Parameters<typeof can>[1]) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, permission)) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
  return role;
}

function parseProductForm(formData: FormData) {
  return productSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    supplierCode: formData.get("supplierCode") || undefined,
    brand: formData.get("brand") || undefined,
    status: formData.get("status"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription") || undefined,
    benefits: formData.get("benefits"),
    features: formData.get("features"),
    materials: formData.get("materials"),
    colors: formData.get("colors"),
    colorImages: formData.get("colorImages"),
    tags: formData.get("tags"),
    price: formData.get("price") || "",
    promoPrice: formData.get("promoPrice") || "",
    saleUnit: formData.get("saleUnit") || undefined,
    minQty: formData.get("minQty"),
    leadTimeDays: formData.get("leadTimeDays"),
    shippingDays: formData.get("shippingDays") || "",
    dimensions: formData.get("dimensions") || undefined,
    printArea: formData.get("printArea") || undefined,
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    images: formData.getAll("images").map(String),
    attributeNames: formData.getAll("attributeName").map(String),
    attributeValues: formData.getAll("attributeValue").map(String),
    objectives: formData.getAll("objectives").map(String),
    profile: formData.get("profile") || undefined,
    priceTier: formData.get("priceTier") || undefined,
    margin: formData.get("margin") || "",
    popularityScore: formData.get("popularityScore") || 0,
  });
}

export async function createProduct(formData: FormData) {
  await requirePermission("products:edit");
  const data = parseProductForm(formData);

  const slug = slugify(data.name);
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      sku: data.sku || null,
      supplierCode: data.supplierCode || null,
      brand: data.brand || null,
      status: data.status,
      categoryId: data.categoryId,
      description: data.description,
      shortDescription: data.shortDescription || null,
      benefits: data.benefits,
      features: data.features,
      materials: data.materials,
      colors: data.colors,
      colorImages: data.colorImages,
      tags: data.tags,
      price: data.price ?? null,
      promoPrice: data.promoPrice ?? null,
      saleUnit: data.saleUnit || "unidade",
      minQty: data.minQty,
      leadTimeDays: data.leadTimeDays,
      shippingDays: data.shippingDays ?? null,
      dimensions: data.dimensions || null,
      printArea: data.printArea || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      images: data.images.length > 0 ? data.images : ["/products/placeholder-1.svg"],
      customizationMethods: [],
      objectives: data.objectives,
      profile: data.profile ?? null,
      priceTier: data.priceTier ?? null,
      margin: data.margin ?? null,
      popularityScore: data.popularityScore,
      attributes: {
        create: data.attributeNames
          .map((name, i) => ({ name, value: data.attributeValues[i] ?? "" }))
          .filter((attr) => attr.name && attr.value),
      },
    },
  });

  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
  redirect(`/admin/produtos/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requirePermission("products:edit");
  const data = parseProductForm(formData);

  await prisma.$transaction([
    prisma.productAttribute.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku || null,
        supplierCode: data.supplierCode || null,
        brand: data.brand || null,
        status: data.status,
        categoryId: data.categoryId,
        description: data.description,
        shortDescription: data.shortDescription || null,
        benefits: data.benefits,
        features: data.features,
        materials: data.materials,
        colors: data.colors,
        colorImages: data.colorImages,
        tags: data.tags,
        price: data.price ?? null,
        promoPrice: data.promoPrice ?? null,
        saleUnit: data.saleUnit || "unidade",
        minQty: data.minQty,
        leadTimeDays: data.leadTimeDays,
        shippingDays: data.shippingDays ?? null,
        dimensions: data.dimensions || null,
        printArea: data.printArea || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        images: data.images.length > 0 ? data.images : ["/products/placeholder-1.svg"],
        objectives: data.objectives,
        profile: data.profile ?? null,
        priceTier: data.priceTier ?? null,
        margin: data.margin ?? null,
        popularityScore: data.popularityScore,
        attributes: {
          create: data.attributeNames
            .map((name, i) => ({ name, value: data.attributeValues[i] ?? "" }))
            .filter((attr) => attr.name && attr.value),
        },
      },
    }),
  ]);

  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidatePath(`/admin/produtos/${id}`);
  redirect(`/admin/produtos/${id}`);
}

export async function deleteProduct(formData: FormData) {
  await requirePermission("products:delete");
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
}

export async function duplicateProduct(formData: FormData) {
  await requirePermission("products:edit");
  const id = String(formData.get("id"));
  const original = await prisma.product.findUnique({
    where: { id },
    include: { attributes: true },
  });
  if (!original) return;

  const baseSlug = `${original.slug}-copia`;
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.product.create({
    data: {
      name: `${original.name} (cópia)`,
      slug,
      sku: null,
      supplierCode: original.supplierCode,
      brand: original.brand,
      status: "RASCUNHO",
      categoryId: original.categoryId,
      description: original.description,
      shortDescription: original.shortDescription,
      benefits: original.benefits,
      features: original.features,
      materials: original.materials,
      colors: original.colors,
      colorImages: original.colorImages ?? {},
      tags: original.tags,
      idealFor: original.idealFor,
      customizationMethods: original.customizationMethods,
      images: original.images,
      price: original.price,
      promoPrice: original.promoPrice,
      saleUnit: original.saleUnit,
      minQty: original.minQty,
      leadTimeDays: original.leadTimeDays,
      shippingDays: original.shippingDays,
      dimensions: original.dimensions,
      printArea: original.printArea,
      attributes: {
        create: original.attributes.map((attr) => ({ name: attr.name, value: attr.value })),
      },
    },
  });

  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
}

export async function bulkUpdateProducts(formData: FormData) {
  await requirePermission("products:edit");
  const ids = formData.getAll("productId").map(String).filter(Boolean);
  if (ids.length === 0) return;

  const categoryId = String(formData.get("categoryId") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const addTags = String(formData.get("addTags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const removeTags = String(formData.get("removeTags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const data: { categoryId?: string; brand?: string; status?: "ATIVO" | "RASCUNHO" | "INDISPONIVEL" } = {};
  if (categoryId) data.categoryId = categoryId;
  if (brand) data.brand = brand;
  if (status === "ATIVO" || status === "RASCUNHO" || status === "INDISPONIVEL") data.status = status;

  if (Object.keys(data).length > 0) {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data });
  }

  for (const tag of addTags) {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { tags: { push: tag } } });
  }

  if (removeTags.length > 0) {
    const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, tags: true } });
    await Promise.all(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { tags: p.tags.filter((t) => !removeTags.includes(t)) },
        })
      )
    );
  }

  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
}

export async function generateMissingDescriptions() {
  await requirePermission("products:edit");

  const products = await prisma.product.findMany({
    where: { shortDescription: null },
    include: { attributes: true },
    take: 20,
  });

  for (const product of products) {
    const dadosTecnicos = Object.fromEntries(product.attributes.map((a) => [a.name, a.value]));
    const text = await enhanceDescription({
      nome: product.name,
      descricaoLonga: product.description,
      dadosTecnicos,
    });
    await prisma.product.update({ where: { id: product.id }, data: { shortDescription: text } });
  }

  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidatePath("/admin/produtos/saude");
}

export async function toggleProductStatus(formData: FormData) {
  await requirePermission("products:edit");
  const id = String(formData.get("id"));
  const current = String(formData.get("status"));
  const next = current === "ATIVO" ? "INDISPONIVEL" : "ATIVO";
  await prisma.product.update({ where: { id }, data: { status: next } });
  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");
}
