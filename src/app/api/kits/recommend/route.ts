import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recommendKit } from "@/lib/kit-recommendation";

const schema = z.object({
  objective: z.enum(["ONBOARDING", "EVENTO", "CLIENTE_VIP", "FEIRA", "PREMIACAO"]),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  budgetPerPerson: z.coerce.number().positive(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Payload inválido." }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const recommendation = await recommendKit(parsed.data);
  if (!recommendation) {
    return NextResponse.json(
      { error: "Não encontramos produtos compatíveis com esse orçamento. Tente um valor por pessoa mais alto." },
      { status: 404 }
    );
  }

  return NextResponse.json(recommendation);
}
