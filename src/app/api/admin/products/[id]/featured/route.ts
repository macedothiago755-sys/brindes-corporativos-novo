import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CACHE_TAGS } from "@/lib/cached-queries";

const bodySchema = z.object({
  isFeatured: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "products:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { featured: parsed.data.isFeatured },
      select: { id: true, featured: true },
    });

    // A home consome os destaques via unstable_cache (tag "products") e via ISR.
    // Invalida ambos para o usuário final ver a mudança imediatamente.
    revalidateTag(CACHE_TAGS.products, "max");
    revalidatePath("/");

    return NextResponse.json({ ok: true, id: product.id, isFeatured: product.featured });
  } catch {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }
}
