import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  mensagem: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const request = await prisma.dataDeletionRequest.create({ data: parsed.data });
  return NextResponse.json({ id: request.id }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "customers:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const requests = await prisma.dataDeletionRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ requests });
}
