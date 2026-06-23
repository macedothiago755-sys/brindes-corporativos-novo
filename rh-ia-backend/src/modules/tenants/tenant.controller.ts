import type { Request, Response } from "express";
import { z } from "zod";
import { tenantService } from "@/modules/tenants/tenant.service";

const createTenantSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  plan: z.enum(["STARTER", "GROWTH", "PRO"]).optional(),
});

export const tenantController = {
  async create(req: Request, res: Response): Promise<void> {
    const input = createTenantSchema.parse(req.body);
    const tenant = await tenantService.create(input);
    res.status(201).json({ data: tenant });
  },

  async list(_req: Request, res: Response): Promise<void> {
    const tenants = await tenantService.list();
    res.status(200).json({ data: tenants });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const tenant = await tenantService.findById(req.params.id as string);
    res.status(200).json({ data: tenant });
  },
};
