import { Router } from "express";
import { knowledgeController } from "@/modules/knowledge/knowledge.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";

export const knowledgeRouter = Router();

knowledgeRouter.post("/ask", asyncHandler(knowledgeController.ask));
knowledgeRouter.post("/upload", asyncHandler(knowledgeController.upload));
knowledgeRouter.post("/chunks", asyncHandler(knowledgeController.addChunk));
