import Anthropic from "@anthropic-ai/sdk";
import { logger } from "@/shared/utils/logger";

/**
 * Camada de resiliência para chamadas à API da Anthropic.
 *
 * O SDK já tenta novamente 429/5xx por padrão (max_retries=2), mas aqui
 * implementamos uma estratégia de Exponential Backoff explícita e observável:
 * cada nova tentativa é registrada no `combined.log` (via logger) com o tempo
 * de espera, para que possamos auditar como o sistema reage a Rate Limits
 * (429) e sobrecarga (529) durante testes de carga e em produção.
 */
export interface RetryOptions {
  /** Número máximo de tentativas (incluindo a primeira). Padrão: 5. */
  maxAttempts?: number;
  /** Atraso base em ms para o backoff exponencial. Padrão: 500ms. */
  baseDelayMs?: number;
  /** Teto de atraso em ms entre tentativas. Padrão: 16000ms. */
  maxDelayMs?: number;
  /** Rótulo da operação, usado nos logs (ex: "RESUME_ANALYSIS"). */
  label?: string;
}

function isRetryableError(error: unknown): boolean {
  // Erros tipados do SDK: 429 (rate limit) e 5xx/529 (overloaded/servidor).
  if (error instanceof Anthropic.RateLimitError) return true;
  if (error instanceof Anthropic.InternalServerError) return true;
  if (error instanceof Anthropic.APIConnectionError) return true;

  // Fallback: alguns ambientes/mocks expõem apenas `status`.
  const status = (error as { status?: number })?.status;
  return status === 429 || status === 529 || (typeof status === "number" && status >= 500);
}

function backoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  // Exponencial (2^n) com full jitter para evitar "thundering herd".
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
  return Math.round(Math.random() * exponential);
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Executa uma chamada à IA com retry + exponential backoff para erros
 * transitórios (429/5xx). Erros não-retentáveis (ex: 400/401) são lançados
 * imediatamente. Esgotadas as tentativas, o último erro é propagado.
 */
export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 5;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 16_000;
  const label = options.label ?? "anthropic_call";

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxAttempts) {
        logger.error("Falha crítica de comunicação com a IA", {
          label,
          attempt,
          maxAttempts,
          retryable: isRetryableError(error),
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      const delay = backoffDelay(attempt, baseDelayMs, maxDelayMs);
      logger.warn("Rate limit/erro transitório da IA — aplicando backoff", {
        label,
        attempt,
        nextAttemptInMs: delay,
        error: error instanceof Error ? error.message : String(error),
      });
      await sleep(delay);
    }
  }

  throw lastError;
}
