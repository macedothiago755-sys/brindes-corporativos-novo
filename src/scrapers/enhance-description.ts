/**
 * Transforma uma descrição técnica de fornecedor em texto comercial premium.
 * Usa a API da OpenAI se OPENAI_API_KEY estiver configurada; caso contrário,
 * aplica um realce baseado em template (sem dependência externa).
 */
export async function enhanceDescription(input: {
  nome: string;
  descricaoCurta?: string;
  descricaoLonga?: string;
  dadosTecnicos: Record<string, string>;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const fonte = input.descricaoLonga || input.descricaoCurta || input.nome;

  if (!apiKey) {
    return templateEnhance(input.nome, fonte, input.dadosTecnicos);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "Você escreve descrições comerciais premium de brindes corporativos para um catálogo B2B. " +
              "Seja objetivo, use no máximo 2 frases, foque no benefício para empresas (eventos, onboarding, clientes, presentes corporativos). " +
              "Nunca invente especificações técnicas que não foram informadas. Responda apenas com o texto final, em português.",
          },
          {
            role: "user",
            content: `Produto: ${input.nome}\nDescrição original do fornecedor: ${fonte}\nCaracterísticas: ${JSON.stringify(
              input.dadosTecnicos
            )}`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI respondeu ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || templateEnhance(input.nome, fonte, input.dadosTecnicos);
  } catch {
    return templateEnhance(input.nome, fonte, input.dadosTecnicos);
  }
}

function templateEnhance(nome: string, fonte: string, dados: Record<string, string>): string {
  const detalhes = Object.entries(dados)
    .filter(([, v]) => v)
    .slice(0, 2)
    .map(([, v]) => v.toLowerCase());

  const sufixo = detalhes.length ? ` em ${detalhes.join(" e ")}` : "";
  return `${nome}${sufixo}, ideal para ações internas, eventos e presentes corporativos personalizados.`;
}
