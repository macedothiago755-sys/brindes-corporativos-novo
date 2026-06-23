import type { NextFunction, Request, Response } from "express";
import type { UsageFeature } from "@prisma/client";
import { prisma } from "@/config/database";
import { ApiError } from "@/shared/utils/ApiError";
import { getMonthlyLimit } from "@/shared/services/planLimits";
import { countUsageThisMonth } from "@/shared/services/usage.service";

/**
 * Roda logo após `requireAuth`. Garante que nenhuma chamada de IA seja
 * processada se o tenant estiver inadimplente/cancelado (402) ou tiver
 * estourado o limite mensal do plano para a feature em questão (403).
 */
export function checkPlanLimits(feature: UsageFeature) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const tenantId = req.tenantId as string;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw ApiError.notFound("Empresa (tenant) não encontrada");
    }

    if (tenant.status !== "ACTIVE") {
      throw new ApiError(
        402,
        "Pagamento pendente ou assinatura cancelada. Regularize o pagamento para continuar usando a IA.",
      );
    }

    const limit = getMonthlyLimit(tenant.plan, feature);
    if (limit !== undefined) {
      const usedThisMonth = await countUsageThisMonth(tenantId, feature);
      if (usedThisMonth >= limit) {
        throw new ApiError(403, "Limite do plano atingido. Faça o upgrade");
      }
    }

    next();
  };
}
