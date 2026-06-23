import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { resolveCouponCode } from "@/lib/coupons";
import { notifyNewQuote } from "@/lib/notify";

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
  const mockupUrl = typeof body.mockupUrl === "string" ? body.mockupUrl : null;
  const mockupFilename = typeof body.mockupFilename === "string" ? body.mockupFilename : null;

  // Anexos: arquivo enviado no formulário + mockup gerado no simulador (se houver).
  const attachmentsToCreate = [
    ...(attachmentUrl ? [{ url: attachmentUrl, filename: attachmentUrl.split("/").pop() ?? "arquivo" }] : []),
    ...(mockupUrl ? [{ url: mockupUrl, filename: mockupFilename ?? mockupUrl.split("/").pop() ?? "mockup" }] : []),
  ];

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const couponCode = await resolveCouponCode(data.couponCode);

  const quote = await prisma.quote.create({
    data: {
      clienteNome: data.clienteNome,
      empresa: data.empresa,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
      observacoes: data.observacoes,
      objetivo: data.objetivo,
      prazo: data.prazo,
      couponCode,
      consentObrigatorioAceito: data.consentObrigatorio === true,
      consentObrigatorioVersion: data.consentVersion,
      consentObrigatorioDate: new Date(),
      consentMarketingAceito: data.consentMarketing,
      consentMarketingVersion: data.consentMarketing ? data.consentVersion : null,
      consentMarketingDate: data.consentMarketing ? new Date() : null,
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
      ...(attachmentsToCreate.length > 0 ? { attachments: { create: attachmentsToCreate } } : {}),
    },
  });

  // Notifica o time comercial sem bloquear a resposta ao cliente. Só dispara
  // se RESEND/webhook estiverem configurados; falhas são engolidas internamente.
  after(() =>
    notifyNewQuote({
      tipo: "orçamento de produto",
      clienteNome: data.clienteNome,
      empresa: data.empresa,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
      resumo: `${product.name} · ${data.quantidade} un.`,
      quoteId: quote.id,
    })
  );

  return NextResponse.json({ id: quote.id }, { status: 201 });
}
