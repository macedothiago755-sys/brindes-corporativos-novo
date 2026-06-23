export interface StructuredJobRequirements {
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  screeningQuestions: string[];
}

export interface Job {
  id: string;
  tenantId: string;
  title: string;
  /** No backend, `description` é uma string JSON de StructuredJobRequirements. */
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobResponse {
  job: Job;
  aiStructuredRequirements: StructuredJobRequirements;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  resumeUrl: string;
  aiScore: number | null;
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  aiScore: number;
  aiSummary: string;
  extractedSkills: string[];
}

export interface UploadResumeResponse {
  candidate: Candidate;
  aiAnalysis: ResumeAnalysis;
}

/** Candidato + análise + perguntas da vaga, consolidados para a UI. */
export interface ScoredCandidate {
  candidate: Candidate;
  analysis: ResumeAnalysis;
}

export function parseJobRequirements(description: string): StructuredJobRequirements | null {
  try {
    return JSON.parse(description) as StructuredJobRequirements;
  } catch {
    return null;
  }
}
