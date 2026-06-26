"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Dispara um evento de analytics (GA4 / dataLayer do GTM) quando montado no
 * cliente. Usado em páginas server-rendered (produto, catálogo) para registrar
 * visualizações sem transformar a página inteira em client component.
 *
 * O efeito re-dispara quando o evento ou os parâmetros mudam — assim a troca de
 * categoria/busca na mesma rota (`/produtos`) também conta como nova visualização.
 */
export function TrackView({
  event,
  params,
}: {
  event: AnalyticsEvent;
  params?: Record<string, unknown>;
}) {
  const serialized = JSON.stringify(params ?? {});

  useEffect(() => {
    trackEvent(event, params ?? {});
    // `serialized` cobre mudanças em `params`; `params` em si muda de referência a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, serialized]);

  return null;
}
