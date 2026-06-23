import { prisma } from "@/config/database";
import { findTopRelevantChunks } from "@/shared/services/vector.service";
import { askClaudeWithContext } from "@/shared/services/anthropic.client";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

interface IngestDocumentInput {
  tenantId: string;
  content: string;
}

interface AskInput {
  tenantId: string;
  question: string;
}

interface AskResult {
  answer: string;
  sources: Array<{ chunkId: string; excerpt: string; score: number }>;
}

/**
 * Quebra `text` em pedaços de `chunkSize` caracteres com `overlap` de
 * sobreposição entre pedaços consecutivos, preservando contexto nas bordas.
 */
export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const normalized = text.trim();
  if (normalized.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push(normalized.slice(start, end).trim());

    if (end === normalized.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

export const knowledgeService = {
  /**
   * Quebra o documento em chunks e persiste todos vinculados ao tenant.
   */
  async ingestDocument(input: IngestDocumentInput) {
    const chunks = chunkText(input.content);

    if (chunks.length === 0) {
      return [];
    }

    return prisma.$transaction(
      chunks.map((content) =>
        prisma.knowledgeChunk.create({
          data: {
            tenantId: input.tenantId,
            content,
            embeddingVectorPlaceholder: [],
          },
        }),
      ),
    );
  },

  async addChunk(tenantId: string, content: string) {
    return prisma.knowledgeChunk.create({
      data: { tenantId, content, embeddingVectorPlaceholder: [] },
    });
  },

  /**
   * Fluxo RAG: busca os chunks do tenant -> rankeia por similaridade com a
   * pergunta -> injeta os top-3 como contexto no Claude 3.5 Sonnet.
   * Nunca consulta chunks de outro tenant (filtro estrito por tenantId).
   */
  async ask(input: AskInput): Promise<AskResult> {
    const chunks = await prisma.knowledgeChunk.findMany({
      where: { tenantId: input.tenantId },
    });

    const topChunks = findTopRelevantChunks(chunks, (chunk) => chunk.content, input.question, 3);

    const answer = await askClaudeWithContext({
      question: input.question,
      contextChunks: topChunks.map((entry) => entry.chunk.content),
    });

    return {
      answer,
      sources: topChunks.map((entry) => ({
        chunkId: entry.chunk.id,
        excerpt: entry.chunk.content.slice(0, 200),
        score: Number(entry.score.toFixed(4)),
      })),
    };
  },
};
