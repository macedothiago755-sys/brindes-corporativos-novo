export function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return stripHtml(input)
    .replace(/\r/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function cleanInline(input: string | null | undefined): string {
  return cleanText(input).replace(/\n+/g, " ").trim();
}

const COLOR_MAP: Record<string, string> = {
  preto: "Preto",
  black: "Preto",
  branco: "Branco",
  white: "Branco",
  azul: "Azul",
  blue: "Azul",
  vermelho: "Vermelho",
  red: "Vermelho",
  verde: "Verde",
  green: "Verde",
  amarelo: "Amarelo",
  yellow: "Amarelo",
  cinza: "Cinza",
  gray: "Cinza",
  grey: "Cinza",
  prata: "Prata",
  silver: "Prata",
  dourado: "Dourado",
  gold: "Dourado",
  laranja: "Laranja",
  orange: "Laranja",
  rosa: "Rosa",
  pink: "Rosa",
  roxo: "Roxo",
  purple: "Roxo",
  marrom: "Marrom",
  brown: "Marrom",
  natural: "Natural",
  transparente: "Transparente",
};

const COLOR_SPLIT_REGEX = /\s*(?:,|\/|;|\be\b)\s*/i;

export function normalizeColor(input: string): string {
  return cleanInline(input)
    .split(COLOR_SPLIT_REGEX)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => COLOR_MAP[part.toLowerCase()] ?? part.replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(", ");
}

export function normalizeUnit(input: string): string {
  return cleanInline(input)
    .replace(/\bml\b/gi, "ml")
    .replace(/\bl\b/gi, "L")
    .replace(/\bcm\b/gi, "cm")
    .replace(/\bmm\b/gi, "mm")
    .replace(/\bkg\b/gi, "kg")
    .replace(/\bg\b/gi, "g")
    .replace(/,/g, ".");
}

export function normalizeDimensions(input: string): string {
  return normalizeUnit(input)
    .replace(/\s*x\s*/gi, " x ")
    .trim();
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePrice(input: string | null | undefined): number | undefined {
  if (!input) return undefined;
  const match = cleanInline(input).match(/[\d.,]+/);
  if (!match) return undefined;

  let raw = match[0];
  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    raw = raw.replace(",", ".");
  } else if (hasDot) {
    const parts = raw.split(".");
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      raw = raw.replace(/\./g, "");
    }
  }

  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : undefined;
}

export function resolveUrl(base: string, maybeRelative: string | null | undefined): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}
