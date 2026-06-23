import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const priceSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().min(1),
        // Preço unitário em reais; não pode ser negativo.
        unitPrice: z.coerce.number().min(0, "O preço unitário não pode ser negativo.").max(10_000_000),
      })
    )
    .min(1, "Informe ao menos um item."),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = priceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: { select: { id: true } } },
  });
  if (!quote) {
    return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });
  }

  // Garante que todos os itens recebidos pertencem a esta cotação.
  const ownIds = new Set(quote.items.map((i) => i.id));
  const invalid = parsed.data.items.filter((i) => !ownIds.has(i.itemId));
  if (invalid.length > 0) {
    return NextResponse.json({ error: "Um ou mais itens não pertencem a este orçamento." }, { status: 400 });
  }

  // Precifica os itens e, se a cotação ainda estiver "Novo", avança para
  // "Respondido" — refletindo que a proposta foi precificada pelo comercial.
  const nextStatus = quote.status === "NOVO" ? "RESPONDIDO" : quote.status;

  try {
    await prisma.$transaction([
      ...parsed.data.items.map((i) =>
        prisma.quoteItem.update({
          where: { id: i.itemId },
          data: { precoUnitario: i.unitPrice },
        })
      ),
      prisma.quote.update({ where: { id }, data: { status: nextStatus } }),
    ]);
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar os preços." }, { status: 500 });
  }

  const total = parsed.data.items.reduce((acc, i) => acc + i.unitPrice, 0);
  return NextResponse.json({ ok: true, status: nextStatus, totalUnitPrices: total });
}
