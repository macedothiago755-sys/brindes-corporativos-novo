import type { Request, Response } from "express";
import { z } from "zod";
import { knowledgeService } from "@/modules/knowledge/knowledge.service";
import { logUsage } from "@/shared/services/usage.service";

const askSchema = z.object({
  question: z.string().min(3, "A pergunta não pode estar vazia"),
});

const uploadSchema = z.object({
  content: z.string().min(20, "Conteúdo do documento é obrigatório"),
  title: z.string().optional(),
});

const addChunkSchema = z.object({
  content: z.string().min(10, "Conteúdo do documento é obrigatório"),
});

export const knowledgeController = {
  async ask(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const { question } = askSchema.parse(req.body);

    const result = await knowledgeService.ask({ tenantId, question });

    await logUsage(tenantId, "KNOWLEDGE_ASK");

    res.status(200).json({ data: result });
  },

  async upload(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const input = uploadSchema.parse(req.body);

    const chunks = await knowledgeService.ingestDocument({
      tenantId,
      content: input.content,
    });

    res.status(201).json({
      data: {
        chunksCreated: chunks.length,
        chunks,
      },
    });
  },

  async addChunk(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const { content } = addChunkSchema.parse(req.body);

    const chunk = await knowledgeService.addChunk(tenantId, content);

    res.status(201).json({ data: chunk });
  },
};
