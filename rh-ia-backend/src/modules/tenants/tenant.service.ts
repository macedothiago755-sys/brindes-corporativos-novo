import { prisma } from "@/config/database";
import type { TenantPlan } from "@prisma/client";
import { ApiError } from "@/shared/utils/ApiError";

interface CreateTenantInput {
  companyName: string;
  plan?: TenantPlan;
}

export const tenantService = {
  async create(input: CreateTenantInput) {
    return prisma.tenant.create({
      data: {
        companyName: input.companyName,
        plan: input.plan,
      },
    });
  },

  async findById(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw ApiError.notFound("Empresa (tenant) não encontrada");
    }
    return tenant;
  },

  async list() {
    return prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  },
};
