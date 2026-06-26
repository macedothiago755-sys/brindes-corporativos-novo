// Passa o mockup personalizado (gerado no visualizador da página de produto)
// para o formulário de orçamento, sem precisar levantar estado para o Server
// Component da página. Mesmo padrão de `coupon-storage`.

export const MOCKUP_STORAGE_KEY = "brindes:mockup";

export interface StoredMockup {
  productId: string;
  /** URL pública do mockup já salvo (Vercel Blob ou /uploads em dev). */
  url: string;
  filename: string;
  /** Parâmetros usados na simulação — úteis para o time comercial reproduzir. */
  params: {
    scale: number;
    x: number;
    y: number;
    opacity: number;
    method: string;
  };
}

export function getStoredMockup(productId: string): StoredMockup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MOCKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMockup;
    return parsed.productId === productId ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredMockup(mockup: StoredMockup) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCKUP_STORAGE_KEY, JSON.stringify(mockup));
}

export function clearStoredMockup() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOCKUP_STORAGE_KEY);
}
