import type { NextConfig } from "next";

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
};

export default nextConfig;
