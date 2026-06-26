// Configuração do Sentry para o runtime Node.js (Server Components, Route
// Handlers, Server Actions). Carregado por src/instrumentation.ts no boot do
// servidor. Sem DSN definido, o init é ignorado — vira no-op seguro.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Amostragem de performance: 100% fora de produção, 10% em produção para
    // controlar volume/custo. Ajuste conforme necessidade.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    // Só envia eventos quando há DSN — evita ruído em dev local sem credencial.
    enabled: Boolean(dsn),
  });
}
