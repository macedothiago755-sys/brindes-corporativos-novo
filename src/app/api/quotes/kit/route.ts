import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { kitQuoteSchema } from "@/lib/validations";
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

  const parsed = kitQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const data = parsed.data;

  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== new Set(productIds).size) {
    return NextResponse.json({ error: "Um ou mais produtos do kit não foram encontrados." }, { status: 404 });
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
      kitId: data.kitId,
      quantidadePessoas: data.quantidadePessoas,
      orcamentoPorPessoa: data.orcamentoPorPessoa,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantidade: item.quantidade,
          cores: item.cores,
          personalizacao: item.personalizacao,
          metodo: item.metodo as never,
        })),
      },
    },
  });

  // Notifica o time comercial sem bloquear a resposta ao cliente. Só dispara
  // se RESEND/webhook estiverem configurados; falhas são engolidas internamente.
  after(() =>
    notifyNewQuote({
      tipo: "orçamento de kit",
      clienteNome: data.clienteNome,
      empresa: data.empresa,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
      resumo: `Kit · ${data.quantidadePessoas ?? "?"} pessoas · ${products.length} itens`,
      quoteId: quote.id,
    })
  );

  return NextResponse.json({ id: quote.id }, { status: 201 });
}
