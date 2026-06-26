import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Imagens de produtos importados vêm de domínios de fornecedores
 * configurados dinamicamente (Admin > Fornecedores), então não podem
 * passar pelo otimizador de imagens do Next sem allowlist estática.
 */
export function isExternalImage(src: string) {
  return /^https?:\/\//.test(src);
}
