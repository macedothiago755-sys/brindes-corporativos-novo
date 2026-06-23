/**
 * Auditoria de custos e quotas.
 *
 * Varre a tabela `UsageLog` e gera um relatório no console com:
 *   - o Tenant que mais consumiu recursos de IA nas últimas 24 horas;
 *   - o custo estimado em dólares (modelo Claude 3.5 Sonnet) com base no
 *     volume de requisições por feature;
 *   - alertas visuais para Tenants que atingiram >= 90% do limite mensal do
 *     seu plano antes do fim do mês.
 *
 * Uso: `npm run quota:check`
 */
import type { UsageFeature } from "@prisma/client";
import { prisma } from "@/config/database";
import { getMonthlyLimit, startOfCurrentMonth } from "@/shared/services/planLimits";

/**
 * Preço do Claude 3.5 Sonnet (USD por 1M de tokens).
 * Fonte: tabela de preços da Anthropic para `claude-3-5-sonnet`.
 */
const SONNET_35_PRICE = { inputPerMTok: 3.0, outputPerMTok: 15.0 };

/**
 * Estimativa de tokens médios consumidos por chamada, por feature. Como ainda
 * não persistimos o uso real de tokens por requisição (apenas a contagem de
 * chamadas em UsageLog.quantity), usamos médias por tipo de operação para
 * estimar o custo. Ajuste conforme dados reais de produção forem coletados.
 */
const AVG_TOKENS_PER_CALL: Record<UsageFeature, { input: number; output: number }> = {
  JOB_CREATION: { input: 600, output: 700 },
  RESUME_ANALYSIS: { input: 3500, output: 500 },
  KNOWLEDGE_ASK: { input: 2000, output: 400 },
};

function estimateCostUsd(feature: UsageFeature, calls: number): number {
  const avg = AVG_TOKENS_PER_CALL[feature];
  const inputCost = (avg.input * calls * SONNET_35_PRICE.inputPerMTok) / 1_000_000;
  const outputCost = (avg.output * calls * SONNET_35_PRICE.outputPerMTok) / 1_000_000;
  return inputCost + outputCost;
}

const usd = (value: number): string => `$${value.toFixed(4)}`;

async function topConsumerLast24h(): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const grouped = await prisma.usageLog.groupBy({
    by: ["tenantId"],
    where: { createdAt: { gte: since } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
  });

  console.log("\n📊 Consumo de IA nas últimas 24h");
  console.log("────────────────────────────────────────────");

  if (grouped.length === 0) {
    console.log("  (nenhum uso registrado nas últimas 24h)");
    return;
  }

  // Custo por feature, por tenant, no período — para estimar o custo em USD.
  const perFeature = await prisma.usageLog.groupBy({
    by: ["tenantId", "feature"],
    where: { createdAt: { gte: since } },
    _sum: { quantity: true },
  });

  const costByTenant = new Map<string, number>();
  for (const row of perFeature) {
    const calls = row._sum.quantity ?? 0;
    const cost = estimateCostUsd(row.feature, calls);
    costByTenant.set(row.tenantId, (costByTenant.get(row.tenantId) ?? 0) + cost);
  }

  const tenantIds = grouped.map((g) => g.tenantId);
  const tenants = await prisma.tenant.findMany({ where: { id: { in: tenantIds } } });
  const nameById = new Map(tenants.map((t) => [t.id, t.companyName]));

  const top = grouped[0]!;
  console.log(
    `🏆 Maior consumidor: ${nameById.get(top.tenantId) ?? top.tenantId} ` +
      `— ${top._sum.quantity ?? 0} chamadas (custo est. ${usd(costByTenant.get(top.tenantId) ?? 0)})`,
  );
  console.log("");

  for (const g of grouped) {
    const cost = costByTenant.get(g.tenantId) ?? 0;
    console.log(
      `  • ${nameById.get(g.tenantId) ?? g.tenantId}: ` +
        `${g._sum.quantity ?? 0} chamadas — ${usd(cost)}`,
    );
  }

  const totalCost = [...costByTenant.values()].reduce((s, c) => s + c, 0);
  console.log("────────────────────────────────────────────");
  console.log(`💵 Custo total estimado (24h): ${usd(totalCost)}`);
}

async function planLimitAlerts(): Promise<void> {
  const monthStart = startOfCurrentMonth();

  const usage = await prisma.usageLog.groupBy({
    by: ["tenantId", "feature"],
    where: { createdAt: { gte: monthStart } },
    _sum: { quantity: true },
  });

  const tenantIds = [...new Set(usage.map((u) => u.tenantId))];
  const tenants = await prisma.tenant.findMany({ where: { id: { in: tenantIds } } });
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  console.log("\n🚦 Alertas de quota (mês corrente)");
  console.log("────────────────────────────────────────────");

  const alerts: string[] = [];
  for (const row of usage) {
    const tenant = tenantById.get(row.tenantId);
    if (!tenant) continue;

    const limit = getMonthlyLimit(tenant.plan, row.feature);
    if (limit === undefined) continue; // feature ilimitada nesse plano

    const used = row._sum.quantity ?? 0;
    const ratio = used / limit;
    if (ratio >= 0.9) {
      const icon = ratio >= 1 ? "🔴" : "🟠";
      alerts.push(
        `${icon} ${tenant.companyName} [${tenant.plan}] ${row.feature}: ` +
          `${used}/${limit} (${Math.round(ratio * 100)}%)`,
      );
    }
  }

  if (alerts.length === 0) {
    console.log("  ✅ Nenhum tenant acima de 90% do limite do plano.");
  } else {
    for (const a of alerts) console.log(`  ${a}`);
  }
}

async function main(): Promise<void> {
  await topConsumerLast24h();
  await planLimitAlerts();
  console.log("");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Erro ao gerar relatório de quotas:", err);
  await prisma.$disconnect();
  process.exit(1);
});
