import { env } from "@/config/env";

export interface StructuredJobRequirements {
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  screeningQuestions: string[];
}

export interface ResumeAnalysisResult {
  aiScore: number;
  aiSummary: string;
  extractedSkills: string[];
}

/**
 * MVP MOCK: simula a chamada à API da Anthropic Claude (modelo claude-sonnet)
 * para estruturar a vaga a partir de um texto livre informado pelo recrutador.
 *
 * Para produção, substituir o corpo desta função por uma chamada real ao
 * SDK da Anthropic usando `env.anthropicApiKey`, mantendo a mesma assinatura.
 */
export async function structureJobWithClaude(
  rawTitle: string,
  rawDescription: string,
): Promise<StructuredJobRequirements> {
  if (!env.anthropicApiKey) {
    console.warn("[claude.helper] ANTHROPIC_API_KEY ausente — retornando resposta mockada");
  }

  return {
    summary: `Vaga para ${rawTitle}: ${rawDescription.slice(0, 160)}...`,
    responsibilities: [
      "Atuar nas demandas do dia a dia da área correspondente",
      "Colaborar com times multidisciplinares",
      "Reportar indicadores e resultados à liderança",
    ],
    requirements: [
      "Experiência prévia na função",
      "Boa comunicação escrita e verbal",
      "Capacidade de trabalhar com prazos e prioridades",
    ],
    niceToHave: ["Inglês intermediário", "Vivência em ambientes ágeis"],
    screeningQuestions: [
      "Conte sobre uma experiência relevante para esta vaga.",
      "Como você lida com prioridades concorrentes?",
      "Por que você quer trabalhar nesta posição?",
    ],
  };
}

/**
 * MVP MOCK: simula a análise de currículo (parse de PDF + scoring por IA).
 * Em produção: extrair texto real do PDF (ex: pdf-parse) e enviar para o
 * modelo junto com a descrição da vaga para obter score e resumo reais.
 */
export async function analyzeResumeWithClaude(
  _resumeUrl: string,
  jobTitle: string,
): Promise<ResumeAnalysisResult> {
  const mockedScore = Math.floor(60 + Math.random() * 40);

  return {
    aiScore: mockedScore,
    aiSummary: `Candidato apresenta experiência compatível com a vaga de ${jobTitle}. Pontos fortes identificados: comunicação e histórico profissional consistente.`,
    extractedSkills: ["Comunicação", "Organização", "Trabalho em equipe"],
  };
}
