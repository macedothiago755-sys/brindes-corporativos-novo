import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["NOVO", "EM_ANALISE", "RESPONDIDO", "APROVADO", "AJUSTE_SOLICITADO", "FECHADO", "PERDIDO"]).optional(),
  observacoes: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const quote = await prisma.quote.update({ where: { id }, data: parsed.data });
  return NextResponse.json(quote);
}
