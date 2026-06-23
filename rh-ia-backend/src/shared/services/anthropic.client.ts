import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/config/env";
import { withExponentialBackoff } from "@/shared/services/ai.service";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

const RH_ASSISTANT_SYSTEM_PROMPT =
  "Você é o assistente virtual de RH da empresa. Responda à pergunta do " +
  "funcionário utilizando APENAS as informações fornecidas no contexto " +
  "abaixo. Se a informação não estiver no contexto, diga educadamente que " +
  "não sabe a resposta e oriente-o a procurar o RH humano. Responda em " +
  "Markdown, de forma clara e objetiva.";

interface AskWithContextInput {
  question: string;
  contextChunks: string[];
}

/**
 * Chama o Claude 3.5 Sonnet com o contexto recuperado (RAG) e a pergunta
 * do colaborador, sob um prompt de sistema rígido que restringe a resposta
 * apenas ao contexto fornecido.
 */
export async function askClaudeWithContext(input: AskWithContextInput): Promise<string> {
  if (!env.anthropicApiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada — defina a variável de ambiente para usar o assistente de RH.",
    );
  }

  const context =
    input.contextChunks.length > 0
      ? input.contextChunks.map((chunk, i) => `[Trecho ${i + 1}]\n${chunk}`).join("\n\n")
      : "(nenhum trecho relevante encontrado na base de conhecimento)";

  const userMessage = `Contexto:\n${context}\n\nPergunta do funcionário: ${input.question}`;

  const response = await withExponentialBackoff(
    () =>
      getClient().messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: RH_ASSISTANT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    { label: "KNOWLEDGE_ASK" },
  );

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
