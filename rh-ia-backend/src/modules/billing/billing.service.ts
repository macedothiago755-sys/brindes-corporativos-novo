import type { TenantPlan } from "@prisma/client";
import { prisma } from "@/config/database";

const PLAN_BY_EXTERNAL_ID: Record<string, TenantPlan> = {
  starter: "STARTER",
  growth: "GROWTH",
  pro: "PRO",
};

export function resolvePlan(externalPlanId: string | undefined | null): TenantPlan {
  if (!externalPlanId) {
    return "STARTER";
  }
  return PLAN_BY_EXTERNAL_ID[externalPlanId.toLowerCase()] ?? "STARTER";
}

interface ActivateSubscriptionInput {
  tenantId?: string;
  stripeCustomerId: string;
  plan: TenantPlan;
}

export const billingService = {
  /**
   * `checkout.session.completed`: ativa o tenant no plano comprado.
   * Localiza o tenant por `tenantId` (vindo de `client_reference_id` no
   * checkout) ou, em renovações futuras, pelo `stripeCustomerId` já salvo.
   */
  async activateSubscription(input: ActivateSubscriptionInput) {
    const tenant = input.tenantId
      ? await prisma.tenant.findUnique({ where: { id: input.tenantId } })
      : await prisma.tenant.findUnique({ where: { stripeCustomerId: input.stripeCustomerId } });

    if (!tenant) {
      throw new Error(`Tenant não encontrado para ativação (tenantId=${input.tenantId})`);
    }

    return prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        status: "ACTIVE",
        plan: input.plan,
        stripeCustomerId: input.stripeCustomerId,
      },
    });
  },

  /**
   * `invoice.payment_failed`: marca o tenant como inadimplente. A partir
   * daqui, `checkPlanLimits` bloqueia toda chamada de IA com 402.
   */
  async markPastDue(stripeCustomerId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { stripeCustomerId } });
    if (!tenant) {
      throw new Error(`Tenant não encontrado para stripeCustomerId=${stripeCustomerId}`);
    }

    return prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: "PAST_DUE" },
    });
  },

  async cancelSubscription(stripeCustomerId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { stripeCustomerId } });
    if (!tenant) {
      throw new Error(`Tenant não encontrado para stripeCustomerId=${stripeCustomerId}`);
    }

    return prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: "CANCELED" },
    });
  },
};
