import { prisma } from "@/config/database";
import { ApiError } from "@/shared/utils/ApiError";
import { analyzeResumeWithClaude, structureJobWithClaude } from "@/modules/jobs/ai/claude.helper";

interface CreateJobInput {
  tenantId: string;
  title: string;
  rawDescription: string;
}

interface CreateCandidateInput {
  tenantId: string;
  jobId: string;
  name: string;
  email: string;
  resumeUrl: string;
}

export const jobsService = {
  async create(input: CreateJobInput) {
    const structured = await structureJobWithClaude(input.title, input.rawDescription);

    const job = await prisma.job.create({
      data: {
        tenantId: input.tenantId,
        title: input.title,
        description: JSON.stringify(structured),
      },
    });

    return { job, structured };
  },

  async findByIdForTenant(jobId: string, tenantId: string) {
    const job = await prisma.job.findFirst({ where: { id: jobId, tenantId } });
    if (!job) {
      throw ApiError.notFound("Vaga não encontrada");
    }
    return job;
  },

  async list(tenantId: string) {
    return prisma.job.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  },

  async addCandidate(input: CreateCandidateInput) {
    const job = await this.findByIdForTenant(input.jobId, input.tenantId);

    const analysis = await analyzeResumeWithClaude(input.resumeUrl, job.title);

    const candidate = await prisma.candidate.create({
      data: {
        jobId: job.id,
        name: input.name,
        email: input.email,
        resumeUrl: input.resumeUrl,
        aiScore: analysis.aiScore,
        aiSummary: analysis.aiSummary,
      },
    });

    return { candidate, analysis };
  },
};
