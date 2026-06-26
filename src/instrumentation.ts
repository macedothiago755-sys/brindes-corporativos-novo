// Ponto de instrumentação do Next.js (App Router). Carrega a config do Sentry
// conforme o runtime e encaminha erros de servidor para o Sentry via o hook
// oficial onRequestError. Sem DSN, os inits viram no-op (ver os arquivos de config).
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captura erros de Server Components, Route Handlers e Server Actions.
export const onRequestError = Sentry.captureRequestError;
