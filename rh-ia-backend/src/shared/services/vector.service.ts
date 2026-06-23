/**
 * Serviço de "vetorização" leve para o MVP do RAG.
 *
 * A Anthropic não expõe API de embeddings, então — em vez de depender de um
 * provedor externo só para isso — implementamos TF-IDF + similaridade de
 * cosseno em memória. É suficiente para rankear chunks de uma base de
 * conhecimento de porte pequeno/médio por tenant, sem infraestrutura extra
 * (ex: pgvector). Pode ser trocado por embeddings reais mantendo a mesma
 * assinatura de `findTopRelevantChunks`.
 */

export interface ScoredChunk<T> {
  chunk: T;
  score: number;
}

const STOPWORDS = new Set([
  "a", "o", "as", "os", "de", "da", "do", "das", "dos", "e", "é", "em", "um", "uma",
  "para", "com", "que", "se", "no", "na", "nos", "nas", "por", "como", "ou", "mas",
  "ao", "aos", "à", "às", "the", "is", "of", "to", "and", "in", "on", "for",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

function buildIdf(documents: string[][]): Map<string, number> {
  const docCount = documents.length;
  const containingDocCount = new Map<string, number>();

  for (const tokens of documents) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      containingDocCount.set(token, (containingDocCount.get(token) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [token, count] of containingDocCount) {
    idf.set(token, Math.log((docCount + 1) / (count + 1)) + 1);
  }
  return idf;
}

function tfidfVector(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = termFrequency(tokens);
  const vector = new Map<string, number>();
  for (const [token, freq] of tf) {
    vector.set(token, freq * (idf.get(token) ?? 0));
  }
  return vector;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  for (const [token, weightA] of a) {
    const weightB = b.get(token);
    if (weightB) {
      dotProduct += weightA * weightB;
    }
  }

  const normA = Math.sqrt([...a.values()].reduce((sum, weight) => sum + weight * weight, 0));
  const normB = Math.sqrt([...b.values()].reduce((sum, weight) => sum + weight * weight, 0));

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Rankeia `chunks` por relevância em relação a `query` usando TF-IDF +
 * similaridade de cosseno, considerando apenas o corpus informado (já deve
 * vir filtrado por tenant_id pelo chamador).
 */
export function findTopRelevantChunks<T>(
  chunks: T[],
  getText: (chunk: T) => string,
  query: string,
  topK = 3,
): ScoredChunk<T>[] {
  if (chunks.length === 0) {
    return [];
  }

  const chunkTokens = chunks.map((chunk) => tokenize(getText(chunk)));
  const queryTokens = tokenize(query);

  const idf = buildIdf([...chunkTokens, queryTokens]);
  const queryVector = tfidfVector(queryTokens, idf);

  const scored = chunks.map((chunk, index) => ({
    chunk,
    score: cosineSimilarity(queryVector, tfidfVector(chunkTokens[index] as string[], idf)),
  }));

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
