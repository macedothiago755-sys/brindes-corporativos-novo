import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const data = parsed.data;
  const attachmentUrl = typeof body.attachmentUrl === "string" ? body.attachmentUrl : null;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const quote = await prisma.quote.create({
    data: {
      clienteNome: data.clienteNome,
      empresa: data.empresa,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
      observacoes: data.observacoes,
      items: {
        create: [
          {
            productId: data.productId,
            quantidade: data.quantidade,
            cores: data.cores,
            personalizacao: data.personalizacao,
            metodo: data.metodo as never,
          },
        ],
      },
      ...(attachmentUrl
        ? { attachments: { create: [{ url: attachmentUrl, filename: attachmentUrl.split("/").pop() ?? "arquivo" }] } }
        : {}),
    },
  });

  // Estrutura preparada para notificação automática (e-mail / WhatsApp / CRM).
  // Integração real depende das credenciais configuradas em .env.

  return NextResponse.json({ id: quote.id }, { status: 201 });
}
