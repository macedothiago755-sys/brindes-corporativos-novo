import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteSchema, cartQuoteSchema } from "@/lib/validations";
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

  // Carrinho multi-item: payload traz um array `items`. Caminho dedicado que
  // cria UMA Quote com vários QuoteItem dentro de uma única transação.
  if (Array.isArray(body.items)) {
    return handleCartQuote(body);
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

// ── Carrinho de Cotações Multi-Item ────────────────────────────────────────
async function handleCartQuote(body: unknown) {
  const parsed = cartQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  // Valida que todos os produtos existem ANTES de abrir a transação, retornando
  // um erro claro em vez de estourar uma violação de FK no meio do insert.
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const foundIds = new Set(products.map((p) => p.id));
  const missing = productIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Um ou mais produtos do carrinho não estão mais disponíveis." },
      { status: 409 }
    );
  }

  const couponCode = await resolveCouponCode(data.couponCode);

  // Observações gerais + CNPJ (não há coluna dedicada; preservamos no texto).
  const observacoes = [`CNPJ: ${data.cnpj}`, data.observacoes?.trim()].filter(Boolean).join("\n\n");

  // Anexos de logo por item viram Attachment da cotação, marcados com o produto.
  const attachmentsToCreate = data.items
    .filter((i) => i.logoUrl)
    .map((i) => ({
      url: i.logoUrl as string,
      filename: i.logoFilename ?? i.logoUrl!.split("/").pop() ?? "logo",
    }));

  let quoteId: string;
  try {
    const quote = await prisma.$transaction(async (tx) => {
      return tx.quote.create({
        data: {
          clienteNome: data.clienteNome,
          empresa: data.empresa,
          email: data.email,
          telefone: data.telefone,
          cidade: data.cidade,
          observacoes,
          couponCode,
          consentObrigatorioAceito: data.consentObrigatorio === true,
          consentObrigatorioVersion: data.consentVersion,
          consentObrigatorioDate: new Date(),
          consentMarketingAceito: data.consentMarketing,
          consentMarketingVersion: data.consentMarketing ? data.consentVersion : null,
          consentMarketingDate: data.consentMarketing ? new Date() : null,
          items: {
            create: data.items.map((i) => ({
              productId: i.productId,
              quantidade: i.quantidade,
              cores: [],
              personalizacao: i.customizationText ? [i.customizationText] : [],
              metodo: [],
            })),
          },
          ...(attachmentsToCreate.length > 0 ? { attachments: { create: attachmentsToCreate } } : {}),
        },
      });
    });
    quoteId = quote.id;
  } catch {
    return NextResponse.json({ error: "Não foi possível registrar o orçamento. Tente novamente." }, { status: 500 });
  }

  after(() =>
    notifyNewQuote({
      tipo: "orçamento multi-item (carrinho)",
      clienteNome: data.clienteNome,
      empresa: data.empresa,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
      resumo: `${data.items.length} produto(s) · ${data.items.reduce((acc, i) => acc + i.quantidade, 0)} un. no total`,
      quoteId,
    })
  );

  return NextResponse.json({ id: quoteId }, { status: 201 });
}
