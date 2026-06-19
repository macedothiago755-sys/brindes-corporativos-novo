"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";

async function requirePermission() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "content:edit")) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}

export async function createTestimonial(formData: FormData) {
  await requirePermission();

  const quote = String(formData.get("quote") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  if (!quote || !name || !company) throw new Error("Preencha depoimento, nome e empresa.");

  await prisma.testimonial.create({
    data: {
      quote,
      name,
      company,
      avatar: String(formData.get("avatar") || "").trim() || null,
    },
  });

  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}

export async function deleteTestimonial(formData: FormData) {
  await requirePermission();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}

export async function createClientLogo(formData: FormData) {
  await requirePermission();

  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  if (!name || !logoUrl) throw new Error("Preencha nome e URL do logo.");

  await prisma.clientLogo.create({ data: { name, logoUrl } });

  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}

export async function deleteClientLogo(formData: FormData) {
  await requirePermission();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.clientLogo.delete({ where: { id } });
  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}
