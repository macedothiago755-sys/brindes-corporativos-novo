"use client";

// Boundary de último recurso: captura erros lançados no layout raiz (que o
// error.tsx normal não alcança). Precisa renderizar suas próprias tags
// <html>/<body>. Reporta ao Sentry (no-op sem DSN).
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Algo deu errado</h1>
          <p style={{ marginTop: "0.75rem", color: "#64748b" }}>
            Tivemos um problema inesperado. Tente novamente.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
