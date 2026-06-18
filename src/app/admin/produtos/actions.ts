"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { productSchema } from "@/lib/validations";

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
      attributes: {
        create: data.attributeNames
          .map((name, i) => ({ name, value: data.attributeValues[i] ?? "" }))
          .filter((attr) => attr.name && attr.value),
      },
    },
  });

  revalidatePath("/admin/produtos");
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
        attributes: {
          create: data.attributeNames
            .map((name, i) => ({ name, value: data.attributeValues[i] ?? "" }))
            .filter((attr) => attr.name && attr.value),
        },
      },
    }),
  ]);

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  redirect(`/admin/produtos/${id}`);
}

export async function deleteProduct(formData: FormData) {
  await requirePermission("products:delete");
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
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
}

export async function toggleProductStatus(formData: FormData) {
  await requirePermission("products:edit");
  const id = String(formData.get("id"));
  const current = String(formData.get("status"));
  const next = current === "ATIVO" ? "INDISPONIVEL" : "ATIVO";
  await prisma.product.update({ where: { id }, data: { status: next } });
  revalidatePath("/admin/produtos");
}
