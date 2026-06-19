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
  if (!can(role, "content:edit")) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}

export async function createSolution(formData: FormData) {
  await requirePermission();

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Informe o título da solução.");

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.solution.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const productIds = formData.getAll("productId").map(String).filter(Boolean);
  const objective = (String(formData.get("objective") || "") || null) as ProductObjective | null;

  const solution = await prisma.solution.create({
    data: {
      title,
      slug,
      description: String(formData.get("description") || "").trim(),
      image: String(formData.get("image") || "").trim() || null,
      ctaLabel: String(formData.get("ctaLabel") || "").trim() || null,
      objective,
      products: { create: productIds.map((productId) => ({ productId })) },
    },
  });

  revalidatePath("/admin/solucoes");
  redirect(`/admin/solucoes/${solution.id}`);
}

export async function updateSolution(solutionId: string, formData: FormData) {
  await requirePermission();

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Informe o título da solução.");

  const productIds = formData.getAll("productId").map(String).filter(Boolean);
  const objective = (String(formData.get("objective") || "") || null) as ProductObjective | null;

  await prisma.$transaction([
    prisma.solutionProduct.deleteMany({ where: { solutionId } }),
    prisma.solution.update({
      where: { id: solutionId },
      data: {
        title,
        description: String(formData.get("description") || "").trim(),
        image: String(formData.get("image") || "").trim() || null,
        ctaLabel: String(formData.get("ctaLabel") || "").trim() || null,
        objective,
        products: { create: productIds.map((productId) => ({ productId })) },
      },
    }),
  ]);

  revalidatePath("/admin/solucoes");
  revalidatePath(`/admin/solucoes/${solutionId}`);
}

export async function deleteSolution(formData: FormData) {
  await requirePermission();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.solution.delete({ where: { id } });
  revalidatePath("/admin/solucoes");
}
