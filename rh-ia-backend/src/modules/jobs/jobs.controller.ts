import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "@/shared/utils/ApiError";
import { jobsService } from "@/modules/jobs/jobs.service";

const createJobSchema = z.object({
  title: z.string().min(2, "Título da vaga é obrigatório"),
  description: z.string().min(10, "Descreva brevemente a vaga para a IA estruturar"),
});

const addCandidateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export const jobsController = {
  async create(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const input = createJobSchema.parse(req.body);

    const { job, structured } = await jobsService.create({
      tenantId,
      title: input.title,
      rawDescription: input.description,
    });

    res.status(201).json({ data: { job, aiStructuredRequirements: structured } });
  },

  async list(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const jobs = await jobsService.list(tenantId);
    res.status(200).json({ data: jobs });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const job = await jobsService.findByIdForTenant(req.params.id as string, tenantId);
    res.status(200).json({ data: job });
  },

  async uploadResume(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId as string;
    const jobId = req.params.id as string;
    const input = addCandidateSchema.parse(req.body);

    if (!req.file) {
      throw ApiError.badRequest("Arquivo de currículo (PDF) é obrigatório");
    }

    const mockedResumeUrl = `mock-storage://resumes/${jobId}/${Date.now()}-${req.file.originalname}`;

    const { candidate, analysis } = await jobsService.addCandidate({
      tenantId,
      jobId,
      name: input.name,
      email: input.email,
      resumeUrl: mockedResumeUrl,
    });

    res.status(201).json({ data: { candidate, aiAnalysis: analysis } });
  },
};
