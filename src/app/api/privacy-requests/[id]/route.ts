import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["ABERTO", "EM_ANALISE", "CONCLUIDO"]),
  notasAdmin: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "customers:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { id } = await params;
  const request = await prisma.dataDeletionRequest.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ request });
}
