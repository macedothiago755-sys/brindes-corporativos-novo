// Dicionário de cores PT-BR → hex, usado para renderizar swatches visuais a
// partir do nome livre cadastrado no admin (Product.colors: string[]). Não há
// hex/disponibilidade no banco — isso resolve o nome em uma cor aproximada
// sem exigir migração ou mudança no admin.
const COLOR_HEX: Record<string, string> = {
  amarelo: "#FFEB3B",
  azul: "#2196F3",
  "azul marinho": "#1A237E",
  "azul claro": "#64B5F6",
  bege: "#E8DCC8",
  branco: "#FFFFFF",
  cinza: "#9E9E9E",
  dourado: "#D4AF37",
  laranja: "#FF9800",
  lilas: "#B39DDB",
  marrom: "#795548",
  preto: "#212121",
  prata: "#C0C0C0",
  rosa: "#F48FB1",
  roxo: "#7B1FA2",
  verde: "#4CAF50",
  "verde escuro": "#1B5E20",
  "verde claro": "#A5D6A7",
  vermelho: "#E53935",
  vinho: "#6D213C",
  transparente: "#FFFFFF",
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Fallback determinístico para nomes não mapeados: gera sempre a mesma cor
// para o mesmo nome (evita depender de uma lista fixa de cores conhecidas).
function hashColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return `hsl(${hash}, 55%, 55%)`;
}

function lookupHex(name: string): string {
  const key = normalize(name);
  return COLOR_HEX[key] ?? hashColor(key);
}

export interface ColorSwatch {
  name: string;
  primary: string;
  secondary: string | null;
}

// "Amarelo com Preto" → swatch bicolor (metade amarelo, metade preto).
export function resolveColorSwatch(name: string): ColorSwatch {
  const parts = name.split(/\s+com\s+/i);
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { name, primary: lookupHex(parts[0]), secondary: lookupHex(parts[1]) };
  }
  return { name, primary: lookupHex(name), secondary: null };
}
