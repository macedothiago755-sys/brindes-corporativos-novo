import type { UsageFeature } from "@prisma/client";
import { prisma } from "@/config/database";
import { startOfCurrentMonth } from "@/shared/services/planLimits";

/**
 * Registra o consumo de uma feature de IA pelo tenant. Deve ser chamado
 * SOMENTE após o sucesso da operação correspondente (vaga criada, currículo
 * analisado, pergunta respondida) — nunca antes, para não contabilizar
 * tentativas que falharam.
 */
export async function logUsage(tenantId: string, feature: UsageFeature, quantity = 1): Promise<void> {
  await prisma.usageLog.create({
    data: { tenantId, feature, quantity },
  });
}

export async function countUsageThisMonth(tenantId: string, feature: UsageFeature): Promise<number> {
  const result = await prisma.usageLog.aggregate({
    where: { tenantId, feature, createdAt: { gte: startOfCurrentMonth() } },
    _sum: { quantity: true },
  });

  return result._sum.quantity ?? 0;
}
