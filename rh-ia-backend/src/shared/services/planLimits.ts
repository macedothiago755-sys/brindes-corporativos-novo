import type { TenantPlan, UsageFeature } from "@prisma/client";

/**
 * Limites mensais por plano e feature. Ausência de entrada para uma
 * feature/plano significa uso ilimitado (ex: knowledge_ask em todos os
 * planos, ou qualquer feature no plano PRO).
 */
export const PLAN_LIMITS: Partial<Record<TenantPlan, Partial<Record<UsageFeature, number>>>> = {
  STARTER: {
    JOB_CREATION: 2,
    RESUME_ANALYSIS: 150,
  },
  GROWTH: {
    JOB_CREATION: 6,
    RESUME_ANALYSIS: 600,
  },
};

export function getMonthlyLimit(plan: TenantPlan, feature: UsageFeature): number | undefined {
  return PLAN_LIMITS[plan]?.[feature];
}

export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
