/**
 * Teste de carga (stress) do endpoint de análise de currículos.
 *
 *   POST /api/v1/jobs/:id/resumes
 *
 * Simula N usuários autenticados, cada um de um Tenant DIFERENTE, fazendo o
 * upload simultâneo de currículos "pesados" (texto com mais de 5.000 palavras)
 * para exercitar:
 *   a) o tempo de resposta do servidor sob concorrência;
 *   b) o comportamento sob Rate Limit (429) da IA — defina
 *      SIMULATE_RATE_LIMIT_RATE no processo do servidor (ex: "0.3") para que
 *      uma fração das análises lance um 429 simulado e o Exponential Backoff
 *      de `ai.service.ts` seja acionado (visível em combined.log).
 *
 * Pré-requisito: o servidor precisa estar rodando e acessível em
 * STRESS_BASE_URL (padrão http://localhost:3001/api/v1).
 *
 * Uso:
 *   npm run stress:resumes
 *   STRESS_USERS=50 STRESS_UPLOADS_PER_USER=3 npm run stress:resumes
 */
import axios, { AxiosError } from "axios";

const BASE_URL = process.env.STRESS_BASE_URL ?? "http://localhost:3001/api/v1";
const USERS = Number(process.env.STRESS_USERS ?? 20);
const UPLOADS_PER_USER = Number(process.env.STRESS_UPLOADS_PER_USER ?? 1);
const REQUEST_TIMEOUT_MS = Number(process.env.STRESS_TIMEOUT_MS ?? 30_000);

interface UploadOutcome {
  ok: boolean;
  status: number | "timeout" | "network";
  durationMs: number;
}

/** Gera um "PDF" com mais de 5.000 palavras de texto (currículo pesado). */
function buildHeavyResumePdf(seed: string): Buffer {
  const lorem =
    "experiência liderança projeto resultados gestão equipe entrega indicadores " +
    "comunicação análise dados processos melhoria contínua estratégia execução ";
  const words: string[] = [];
  let i = 0;
  while (words.length < 5200) {
    words.push(`${lorem.split(" ")[i % 16]}${seed.slice(0, 4)}`);
    i++;
  }
  const body = words.join(" ");
  // Estrutura mínima de PDF — suficiente para o filtro de mimetype do multer.
  const content = `%PDF-1.4\n% currículo de carga\n1 0 obj\n<< /Type /Catalog >>\nendobj\nstream\n${body}\nendstream\n%%EOF\n`;
  return Buffer.from(content, "utf-8");
}

async function registerTenant(index: number): Promise<{ token: string }> {
  const unique = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
  const { data } = await axios.post(
    `${BASE_URL}/auth/register`,
    {
      companyName: `Empresa Stress ${unique}`,
      name: `Recrutador ${index}`,
      email: `stress.${unique}@example.com`,
      password: "senha-super-segura-123",
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );
  return { token: data.data.token };
}

async function createJob(token: string): Promise<string> {
  const { data } = await axios.post(
    `${BASE_URL}/jobs`,
    { title: "Analista de Operações", description: "Vaga para triagem em teste de carga." },
    { headers: { Authorization: `Bearer ${token}` }, timeout: REQUEST_TIMEOUT_MS },
  );
  return data.data.job.id;
}

async function uploadResume(token: string, jobId: string, seed: string): Promise<UploadOutcome> {
  const pdf = buildHeavyResumePdf(seed);
  const form = new FormData();
  form.append("name", `Candidato ${seed.slice(0, 6)}`);
  form.append("email", `candidato.${seed}@example.com`);
  form.append("resume", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), "curriculo.pdf");

  const startedAt = performance.now();
  try {
    const res = await axios.post(`${BASE_URL}/jobs/${jobId}/resumes`, form, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return { ok: true, status: res.status, durationMs: performance.now() - startedAt };
  } catch (err) {
    const durationMs = performance.now() - startedAt;
    const axiosErr = err as AxiosError;
    if (axiosErr.code === "ECONNABORTED") return { ok: false, status: "timeout", durationMs };
    if (axiosErr.response) return { ok: false, status: axiosErr.response.status, durationMs };
    return { ok: false, status: "network", durationMs };
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx] as number;
}

async function main(): Promise<void> {
  console.log(
    `\n🔥 Stress: ${USERS} tenants × ${UPLOADS_PER_USER} upload(s) → ${BASE_URL}/jobs/:id/resumes\n`,
  );

  // Setup sequencial-concorrente: registra cada tenant e cria uma vaga.
  console.log("→ Preparando tenants e vagas...");
  const prepared = await Promise.allSettled(
    Array.from({ length: USERS }, async (_, i) => {
      const { token } = await registerTenant(i);
      const jobId = await createJob(token);
      return { token, jobId };
    }),
  );

  const ready = prepared
    .filter((r): r is PromiseFulfilledResult<{ token: string; jobId: string }> => r.status === "fulfilled")
    .map((r) => r.value);

  const setupFailures = prepared.length - ready.length;
  if (setupFailures > 0) {
    console.warn(`⚠️  ${setupFailures} tenant(s) falharam no setup (servidor no ar?).`);
  }
  if (ready.length === 0) {
    console.error("❌ Nenhum tenant pôde ser preparado. O servidor está rodando em STRESS_BASE_URL?");
    process.exitCode = 1;
    return;
  }

  // Disparo concorrente em massa de todos os uploads.
  console.log(`→ Disparando ${ready.length * UPLOADS_PER_USER} uploads simultâneos...\n`);
  const overallStart = performance.now();

  const tasks: Promise<UploadOutcome>[] = [];
  for (const { token, jobId } of ready) {
    for (let u = 0; u < UPLOADS_PER_USER; u++) {
      tasks.push(uploadResume(token, jobId, `${jobId}-${u}-${Math.random().toString(36).slice(2, 8)}`));
    }
  }
  const outcomes = await Promise.all(tasks);
  const wallClockMs = performance.now() - overallStart;

  // Relatório.
  const durations = outcomes.map((o) => o.durationMs).sort((a, b) => a - b);
  const ok = outcomes.filter((o) => o.ok);
  const rateLimited = outcomes.filter((o) => o.status === 429);
  const timeouts = outcomes.filter((o) => o.status === "timeout");
  const failed = outcomes.filter((o) => !o.ok);
  const avg = durations.reduce((s, d) => s + d, 0) / (durations.length || 1);

  console.log("──────────── RESULTADO ────────────");
  console.log(`Total de requisições : ${outcomes.length}`);
  console.log(`Sucesso (2xx)        : ${ok.length}`);
  console.log(`Rate limited (429)   : ${rateLimited.length}`);
  console.log(`Timeouts             : ${timeouts.length}`);
  console.log(`Falhas (total)       : ${failed.length}`);
  console.log("");
  console.log(`Tempo de resposta (ms):`);
  console.log(`  min : ${Math.round(durations[0] ?? 0)}`);
  console.log(`  avg : ${Math.round(avg)}`);
  console.log(`  p50 : ${Math.round(percentile(durations, 50))}`);
  console.log(`  p95 : ${Math.round(percentile(durations, 95))}`);
  console.log(`  p99 : ${Math.round(percentile(durations, 99))}`);
  console.log(`  max : ${Math.round(durations[durations.length - 1] ?? 0)}`);
  console.log("");
  console.log(`Throughput           : ${(outcomes.length / (wallClockMs / 1000)).toFixed(1)} req/s`);
  console.log(`Wall clock           : ${Math.round(wallClockMs)} ms`);
  console.log("───────────────────────────────────\n");

  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Erro fatal no teste de carga:", err);
  process.exit(1);
});
