interface CategoryLike {
  id: string;
  name: string;
}

// Faixa Unicode dos sinais diacríticos combinantes (U+0300–U+036F), gerada via
// charCode para evitar ambiguidade de escape de string com `\uXXXX` literais.
const COMBINING_MARKS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, "g");

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim();
}

/**
 * Sugere a categoria interna mais próxima do texto de categoria extraído do
 * fornecedor. É apenas uma sugestão para pré-selecionar no formulário de
 * revisão — o admin sempre pode trocar antes de importar.
 */
export function matchCategory(extracted: string | null | undefined, categories: CategoryLike[]): CategoryLike | null {
  if (!extracted || categories.length === 0) return null;
  const needle = normalize(extracted);
  if (!needle) return null;

  const exact = categories.find((c) => normalize(c.name) === needle);
  if (exact) return exact;

  const contains = categories.find((c) => {
    const name = normalize(c.name);
    return name.includes(needle) || needle.includes(name);
  });
  if (contains) return contains;

  const needleWords = new Set(needle.split(/\s+/).filter(Boolean));
  let best: { category: CategoryLike; score: number } | null = null;
  for (const category of categories) {
    const words = normalize(category.name).split(/\s+/).filter(Boolean);
    const score = words.filter((w) => needleWords.has(w)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { category, score };
    }
  }
  return best?.category ?? null;
}
