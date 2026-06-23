import { Router } from "express";
import { webhookController } from "@/modules/billing/webhook.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";

export const webhookRouter = Router();

webhookRouter.post("/stripe", asyncHandler(webhookController.handleStripeEvent));
