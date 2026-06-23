import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Logger mínimo, sem dependências externas. Escreve no console e, de forma
 * assíncrona e best-effort, em `combined.log` na raiz do backend — para que
 * gargalos de performance e falhas de comunicação com a IA possam ser
 * depurados após o fato (ex: durante/depois de um teste de carga).
 *
 * O caminho do arquivo pode ser sobrescrito via LOG_FILE.
 */
const LOG_FILE = resolve(process.cwd(), process.env.LOG_FILE ?? "combined.log");

type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const line = JSON.stringify(entry);

  const consoleFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  consoleFn(`[${level}] ${message}`, meta ?? "");

  // Persistência best-effort — nunca deixa um erro de log derrubar a requisição.
  void appendFile(LOG_FILE, `${line}\n`).catch(() => {
    /* ignora falha de escrita de log */
  });
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
