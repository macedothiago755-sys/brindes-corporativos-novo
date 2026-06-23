import { Router } from "express";
import { tenantController } from "@/modules/tenants/tenant.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";

export const tenantRouter = Router();

tenantRouter.post("/", asyncHandler(tenantController.create));
tenantRouter.get("/", asyncHandler(tenantController.list));
tenantRouter.get("/:id", asyncHandler(tenantController.getById));
