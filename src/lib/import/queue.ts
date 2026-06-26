import { startImportJob } from "@/lib/importer";

/**
 * Ponto único de enfileiramento de importações. Hoje dispara o job em
 * background no mesmo processo (suficiente para o volume atual). Trocar por
 * uma fila real (BullMQ/pg-boss) fica isolado aqui — quem chama não muda.
 */
export function enqueueImportJob(jobId: string): void {
  void startImportJob(jobId).catch((err) => {
    console.error(`[import-queue] Falha ao processar o job ${jobId}:`, err);
  });
}
