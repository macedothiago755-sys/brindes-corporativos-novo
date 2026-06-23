import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/config/env";
import { withExponentialBackoff } from "@/shared/services/ai.service";

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
  // Mesmo sendo um mock, a análise passa pela camada de resiliência
  // (`withExponentialBackoff`) para que o comportamento sob Rate Limit (429)
  // seja exercitado em testes de carga. Definindo SIMULATE_RATE_LIMIT_RATE
  // (ex: "0.3"), uma fração das chamadas lança um 429 simulado antes de
  // suceder em uma nova tentativa — demonstrando o backoff de ponta a ponta.
  const simulatedRate = Number(process.env.SIMULATE_RATE_LIMIT_RATE ?? 0);

  return withExponentialBackoff(
    async () => {
      if (simulatedRate > 0 && Math.random() < simulatedRate) {
        throw new Anthropic.RateLimitError(
          429,
          { type: "error", error: { type: "rate_limit_error", message: "simulated 429" } },
          "rate_limit_error (simulado)",
          new Headers(),
        );
      }

      const mockedScore = Math.floor(60 + Math.random() * 40);
      return {
        aiScore: mockedScore,
        aiSummary: `Candidato apresenta experiência compatível com a vaga de ${jobTitle}. Pontos fortes identificados: comunicação e histórico profissional consistente.`,
        extractedSkills: ["Comunicação", "Organização", "Trabalho em equipe"],
      };
    },
    { label: "RESUME_ANALYSIS" },
  );
}
