// Configuração do Sentry para o runtime Edge (middleware e rotas em edge).
// Carregado por src/instrumentation.ts quando NEXT_RUNTIME === "edge".
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    enabled: Boolean(dsn),
  });
}
