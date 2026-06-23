import { prisma } from "@/config/database";

interface AskInput {
  tenantId: string;
  question: string;
}

interface AskResult {
  answer: string;
  sources: Array<{ chunkId: string; excerpt: string }>;
}

/**
 * MVP MOCK: simula a busca semântica (embedding da pergunta + similaridade
 * de cosseno contra `embedding_vector_placeholder`) restrita ao tenant.
 *
 * Em produção: gerar embedding da `question`, comparar com os chunks do
 * tenant (idealmente via pgvector) e enviar os top-k trechos como contexto
 * para o modelo de IA responder.
 */
export const knowledgeService = {
  async ask(input: AskInput): Promise<AskResult> {
    const chunks = await prisma.knowledgeChunk.findMany({
      where: { tenantId: input.tenantId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    if (chunks.length === 0) {
      return {
        answer:
          "Ainda não há documentos suficientes na base de conhecimento desta empresa para responder com precisão.",
        sources: [],
      };
    }

    return {
      answer: `Com base nos documentos da empresa, aqui está uma resposta simulada para: "${input.question}"`,
      sources: chunks.map((chunk) => ({
        chunkId: chunk.id,
        excerpt: chunk.content.slice(0, 200),
      })),
    };
  },

  async addChunk(tenantId: string, content: string) {
    return prisma.knowledgeChunk.create({
      data: {
        tenantId,
        content,
        embeddingVectorPlaceholder: [],
      },
    });
  },
};
