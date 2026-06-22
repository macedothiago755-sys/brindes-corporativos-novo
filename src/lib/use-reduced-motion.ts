import { useEffect, useState } from "react";

/**
 * Retorna true quando o usuário pediu movimento reduzido no sistema
 * (prefers-reduced-motion: reduce). Use para desligar autoplay e animações
 * não essenciais — WCAG 2.3.3 e segurança vestibular.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
