"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { ProductObjective } from "@prisma/client";

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
  if (!can(role, "kits:edit")) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}

function parseItems(formData: FormData) {
  const productIds = formData.getAll("itemProductId").map(String);
  const quantities = formData.getAll("itemQuantity").map((v) => Number(v) || 1);
  return productIds
    .map((productId, i) => ({ productId, quantityPerPerson: quantities[i] ?? 1 }))
    .filter((item) => item.productId);
}

export async function createKit(formData: FormData) {
  await requirePermission();

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Informe o nome do kit.");

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.kit.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const items = parseItems(formData);
  const objective = (String(formData.get("objective") || "") || null) as ProductObjective | null;
  const description = String(formData.get("description") || "").trim() || null;
  const image = String(formData.get("image") || "").trim() || null;
  const estimatedPricePerPerson = formData.get("estimatedPricePerPerson")
    ? Number(formData.get("estimatedPricePerPerson"))
    : null;

  const kit = await prisma.kit.create({
    data: {
      name,
      slug,
      description,
      image,
      objective,
      estimatedPricePerPerson,
      manual: true,
      items: { create: items.map((item, order) => ({ ...item, order })) },
    },
  });

  revalidatePath("/admin/kits");
  redirect(`/admin/kits/${kit.id}`);
}

export async function updateKit(kitId: string, formData: FormData) {
  await requirePermission();

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Informe o nome do kit.");

  const items = parseItems(formData);
  const objective = (String(formData.get("objective") || "") || null) as ProductObjective | null;
  const description = String(formData.get("description") || "").trim() || null;
  const image = String(formData.get("image") || "").trim() || null;
  const active = formData.get("active") === "on";
  const estimatedPricePerPerson = formData.get("estimatedPricePerPerson")
    ? Number(formData.get("estimatedPricePerPerson"))
    : null;

  await prisma.$transaction([
    prisma.kitItem.deleteMany({ where: { kitId } }),
    prisma.kit.update({
      where: { id: kitId },
      data: {
        name,
        description,
        image,
        objective,
        active,
        estimatedPricePerPerson,
        items: { create: items.map((item, order) => ({ ...item, order })) },
      },
    }),
  ]);

  revalidatePath("/admin/kits");
  revalidatePath(`/admin/kits/${kitId}`);
}

export async function deleteKit(formData: FormData) {
  await requirePermission();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.kit.delete({ where: { id } });
  revalidatePath("/admin/kits");
}
