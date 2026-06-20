export const LEGAL_VERSION_HISTORY = [
  { version: "2026-06-20", label: "v1.0", summary: "Publicação inicial do Aviso de Privacidade, Termos de Uso e Política de Cookies." },
] as const;

export const LEGAL_TERMS_VERSION = LEGAL_VERSION_HISTORY[LEGAL_VERSION_HISTORY.length - 1].version;

export const COOKIE_CATEGORIES = ["essenciais", "estatisticos", "marketing"] as const;
export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];
