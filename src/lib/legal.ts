export const LEGAL_TERMS_VERSION = "2026-06-20";

export const COOKIE_CATEGORIES = ["essenciais", "analise", "marketing"] as const;
export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];
