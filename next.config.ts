import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    // AVIF primeiro (melhor compressão), WebP como fallback. Reduz drasticamente
    // o peso das imagens locais otimizáveis — banners da home (1717x916, o LCP),
    // logo e placeholders — sem perda visível de qualidade.
    formats: ["image/avif", "image/webp"],
    // Mantém a imagem otimizada em cache por mais tempo (31 dias). O catálogo é
    // estável; evita reprocessar a mesma imagem a cada acesso.
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/inspiracoes", permanent: true },
      { source: "/blog/:slug", destination: "/inspiracoes/:slug", permanent: true },
    ];
  },
};

// Envolve a config com o Sentry. O upload de source maps só é acionado quando
// SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN estão presentes (em produção na
// Vercel) — sem eles, o build segue normalmente, apenas sem source maps.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Encaminha requisições do SDK por uma rota do próprio domínio, evitando
  // bloqueio por ad-blockers no client.
  tunnelRoute: "/monitoring",
});
