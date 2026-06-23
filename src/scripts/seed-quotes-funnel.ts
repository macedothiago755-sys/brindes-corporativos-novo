/**
 * Seed isolado do funil comercial B2B.
 *
 * Injeta 4 cotações realistas cobrindo os estágios do funil para auditar
 * visualmente o painel admin, a geração de PDF e a rota pública de aprovação
 * sem precisar cadastrar cotações manualmente.
 *
 * Uso: npm run seed:quotes
 *
 * Mapeamento dos rótulos de negócio → enum real `QuoteStatus`:
 *   PENDENTE          → NOVO              (acabou de chegar)
 *   ENVIADA           → RESPONDIDO        (proposta enviada, aguardando cliente)
 *   AJUSTE SOLICITADO → AJUSTE_SOLICITADO (em negociação)
 *   APROVADA          → APROVADO          (venda fechada)
 *
 * Campos do schema (camelCase): approvalToken, viewCount, lastViewedAt, feedbackNotes.
 *
 * Idempotente: remove cotações de teste anteriores (pelos tokens fixos e e-mails
 * conhecidos) antes de reinserir, para poder rodar várias vezes.
 */
import { PrismaClient, CustomizationMethod, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const FIXED_TOKENS = ["token_teste_inovabank_2026", "token_teste_agro_2026"] as const;
const SEED_EMAILS = [
  "carlos@techcorp.com.br",
  "mariana@inovabank.com.br",
  "roberto@agrologistica.com.br",
  "compras@sistemascloud.com.br",
] as const;

function minutesAgo(min: number): Date {
  return new Date(Date.now() - min * 60 * 1000);
}

async function cleanupPreviousSeed() {
  // Remove cotações de teste anteriores (cascade apaga items/attachments).
  const deleted = await prisma.quote.deleteMany({
    where: {
      OR: [{ approvalToken: { in: [...FIXED_TOKENS] } }, { email: { in: [...SEED_EMAILS] } }],
    },
  });
  if (deleted.count > 0) {
    console.log(`🧹 Removidas ${deleted.count} cotação(ões) de teste anterior(es).`);
  }
}

async function main() {
  console.log("🌱 Semeando funil comercial de cotações de teste...\n");

  // 1. Garante que existem produtos ativos antes de criar QuoteItems (FK).
  const products = await prisma.product.findMany({
    where: { status: "ATIVO" },
    take: 3,
    orderBy: { createdAt: "asc" },
  });

  if (products.length === 0) {
    console.error(
      "❌ Nenhum produto ATIVO encontrado no banco. Rode `npm run db:seed` primeiro para popular o catálogo."
    );
    process.exitCode = 1;
    return;
  }

  // Fallback resiliente: se houver menos de 2 produtos, reaproveita o primeiro
  // para os dois itens (evita erro de índice fora do array).
  const productoCaderno = products[0];
  const productoCaneta = products[1] ?? products[0];
  console.log(
    `📦 Usando produtos ativos: "${productoCaderno.name}"${
      productoCaneta.id !== productoCaderno.id ? ` e "${productoCaneta.name}"` : ""
    }\n`
  );

  await cleanupPreviousSeed();

  const baseItem = {
    cores: ["Azul Marinho", "Branco"],
    personalizacao: ["Logo gravado"],
    metodo: [CustomizationMethod.SILK_SCREEN, CustomizationMethod.IMPRESSAO_UV],
  };

  // ── COTAÇÃO A — PENDENTE (NOVO) ───────────────────────────────────────────
  const quoteA = await prisma.quote.create({
    data: {
      clienteNome: "Carlos RH",
      empresa: "TechCorp Brasil",
      email: "carlos@techcorp.com.br",
      telefone: "(11) 98888-0001",
      cidade: "São Paulo",
      objetivo: "Onboarding de novos colaboradores",
      status: "NOVO",
      approvalToken: null, // admin ainda precisa precificar e gerar o link
      viewCount: 0,
      items: {
        create: [
          { productId: productoCaderno.id, quantidade: 200, ...baseItem },
          { productId: productoCaneta.id, quantidade: 200, ...baseItem },
        ],
      },
    },
  });
  console.log(`✅ A · PENDENTE   → ${quoteA.empresa} (sem token, viewCount 0)`);

  // ── COTAÇÃO B — ENVIADA (RESPONDIDO) ──────────────────────────────────────
  const quoteB = await prisma.quote.create({
    data: {
      clienteNome: "Mariana Marketing",
      empresa: "InovaBank S/A",
      email: "mariana@inovabank.com.br",
      telefone: "(11) 97777-0002",
      cidade: "Rio de Janeiro",
      objetivo: "Brindes para evento corporativo",
      status: "RESPONDIDO",
      approvalToken: "token_teste_inovabank_2026",
      viewCount: 4,
      lastViewedAt: minutesAgo(18),
      items: {
        create: [{ productId: productoCaderno.id, quantidade: 150, ...baseItem }],
      },
      // Logo do cliente para testar a sobreposição do mockup no PDF.
      attachments: {
        create: [
          {
            url: "/uploads/seed/logo-inovabank.png",
            filename: "logo-inovabank.png",
          },
        ],
      },
    },
  });
  console.log(`✅ B · ENVIADA    → ${quoteB.empresa} (token fixo, viewCount 4, +logo)`);

  // ── COTAÇÃO C — AJUSTE SOLICITADO (AJUSTE_SOLICITADO) ─────────────────────
  const quoteC = await prisma.quote.create({
    data: {
      clienteNome: "Roberto Compras",
      empresa: "AgroLogística S/A",
      email: "roberto@agrologistica.com.br",
      telefone: "(11) 96666-0003",
      cidade: "Campinas",
      objetivo: "Kit de fim de ano para parceiros",
      status: "AJUSTE_SOLICITADO",
      approvalToken: "token_teste_agro_2026",
      viewCount: 7,
      lastViewedAt: minutesAgo(120),
      feedbackNotes:
        "Gostamos da proposta, mas a diretoria pediu para recalcular a caneta para 500 unidades para ver se o preço unitário cai para R$ 4,50. Conseguem ajustar?",
      items: {
        create: [{ productId: productoCaneta.id, quantidade: 300, ...baseItem }],
      },
    },
  });
  // Registro de auditoria do feedback enviado pelo cliente.
  await prisma.auditLog.create({
    data: { action: "VIEW", targetType: "Quote", targetId: quoteC.id },
  });
  console.log(`✅ C · AJUSTE     → ${quoteC.empresa} (feedback_notes + AuditLog)`);

  // ── COTAÇÃO D — APROVADA (APROVADO) ───────────────────────────────────────
  const quoteD = await prisma.quote.create({
    data: {
      clienteNome: "Fernanda Diretoria",
      empresa: "Sistemas Cloud & Cia",
      email: "compras@sistemascloud.com.br",
      telefone: "(11) 95555-0004",
      cidade: "São Paulo",
      objetivo: "Premiação de metas anuais",
      status: "APROVADO",
      approvalToken: "token_teste_cloud_2026",
      viewCount: 12,
      lastViewedAt: minutesAgo(1440),
      items: {
        create: [{ productId: productoCaderno.id, quantidade: 500, ...baseItem }],
      },
    },
  });
  console.log(`✅ D · APROVADA   → ${quoteD.empresa} (venda fechada)\n`);

  console.log("🎉 Funil semeado com sucesso. Links públicos de aprovação para teste:");
  console.log(`   • InovaBank (enviada): /orcamento/aprovar/token_teste_inovabank_2026`);
  console.log(`   • AgroLogística (ajuste): /orcamento/aprovar/token_teste_agro_2026`);
}

main()
  .catch((err) => {
    // Trata erros de constraint de forma legível (FK ausente, token duplicado, etc.).
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        console.error(
          "❌ Erro de chave estrangeira (P2003): um productId referenciado não existe neste banco. " +
            "Rode `npm run db:seed` para garantir o catálogo antes de semear o funil."
        );
      } else if (err.code === "P2002") {
        console.error(
          "❌ Constraint de unicidade violada (P2002): provável token duplicado. " +
            "O script já tenta limpar seeds anteriores; verifique cotações criadas manualmente."
        );
      } else {
        console.error(`❌ Erro Prisma (${err.code}): ${err.message}`);
      }
    } else {
      console.error("❌ Erro inesperado ao semear o funil:", err);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
