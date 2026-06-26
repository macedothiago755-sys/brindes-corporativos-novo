// Configuração do Sentry no navegador. Captura erros de client components e
// navegações. Sem NEXT_PUBLIC_SENTRY_DSN, o init é ignorado (no-op seguro).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    enabled: Boolean(dsn),
  });
}

// Instrumenta o início das transições de rota do App Router para rastreamento
// de navegação no Sentry.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
