import { Router } from "express";
import { knowledgeController } from "@/modules/knowledge/knowledge.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { requireRole } from "@/shared/middlewares/requireRole";
import { checkPlanLimits } from "@/shared/middlewares/billing.middleware";

export const knowledgeRouter = Router();

// Manter a base de conhecimento é tarefa da equipe de RH do tenant.
const hrStaffOnly = requireRole("OWNER", "ADMIN", "RECRUITER");

// Qualquer colaborador autenticado pode perguntar ao assistente de RH.
knowledgeRouter.post(
  "/ask",
  asyncHandler(checkPlanLimits("KNOWLEDGE_ASK")),
  asyncHandler(knowledgeController.ask),
);
knowledgeRouter.post("/upload", hrStaffOnly, asyncHandler(knowledgeController.upload));
knowledgeRouter.post("/chunks", hrStaffOnly, asyncHandler(knowledgeController.addChunk));
