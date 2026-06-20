import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

const WELCOME_COUPON_CODE = "BEMVINDO5";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: WELCOME_COUPON_CODE } });

  const now = new Date();
  await prisma.lead.create({
    data: {
      nome: parsed.data.nome,
      empresa: parsed.data.empresa,
      email: parsed.data.email,
      telefone: parsed.data.telefone,
      couponCode: coupon?.active ? coupon.code : null,
      consentObrigatorioAceito: parsed.data.consentObrigatorio,
      consentObrigatorioVersion: parsed.data.consentVersion,
      consentObrigatorioDate: now,
      consentMarketingAceito: parsed.data.consentMarketing,
      consentMarketingVersion: parsed.data.consentMarketing ? parsed.data.consentVersion : null,
      consentMarketingDate: parsed.data.consentMarketing ? now : null,
    },
  });

  return NextResponse.json({ couponCode: coupon?.active ? coupon.code : WELCOME_COUPON_CODE }, { status: 201 });
}
