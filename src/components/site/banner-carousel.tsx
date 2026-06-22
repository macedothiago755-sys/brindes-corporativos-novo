"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type Banner = {
  src: string;
  alt: string;
  href: string;
};

// Banners premium (1717x916) — peças completas com texto e CTA embutidos.
// Exibidos na proporção nativa, sem corte, em desktop e mobile.
const banners: Banner[] = [
  {
    src: "/banners/banner-home-1-marca.jpg",
    alt: "Brindes corporativos personalizados: fortaleça sua marca em cada detalhe",
    href: "/montar-kit",
  },
  {
    src: "/banners/banner-home-2-hidratacao.jpg",
    alt: "Garrafas e squeezes personalizados para empresas",
    href: "/categoria/squeezes-e-garrafas",
  },
  {
    src: "/banners/banner-home-3-sustentavel.jpg",
    alt: "Produtos ecológicos e sustentáveis personalizados com a marca da empresa",
    href: "/categoria/linha-ecologica",
  },
];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const goTo = useCallback((i: number) => {
    setIndex((i + banners.length) % banners.length);
  }, []);

  // Autoplay só roda quando há mais de um banner, não foi pausado pelo usuário,
  // não está sob hover/foco e o usuário não pediu movimento reduzido (WCAG 2.2.2 e 2.3.3).
  const autoplay = banners.length > 1 && !paused && !interacting && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(timer);
  }, [autoplay, index, goTo]);

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="bg-muted"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
    >
      <div className="container-premium py-6 sm:py-8">
        <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg">
          {/* Proporção nativa dos banners (1717x916) — sem corte */}
          <div className="relative aspect-[1717/916] w-full">
            {banners.map((banner, i) => (
              <Link
                key={banner.src}
                href={banner.href}
                aria-hidden={i !== index}
                tabIndex={i === index ? 0 : -1}
                className={cn(
                  "absolute inset-0 block transition-opacity duration-700",
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  preload={i === 0}
                  className="object-cover"
                  sizes="(min-width: 1280px) 1200px, 100vw"
                />
              </Link>
            ))}
          </div>

          {banners.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Banner anterior"
                onClick={() => goTo(index - 1)}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background sm:left-4 sm:h-11 sm:w-11"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Próximo banner"
                onClick={() => goTo(index + 1)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background sm:right-4 sm:h-11 sm:w-11"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
                {banners.map((banner, i) => (
                  <button
                    key={banner.src}
                    type="button"
                    aria-label={`Ir para o banner ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-6 bg-accent" : "w-1.5 bg-background/70"
                    )}
                  />
                ))}
              </div>

              {!reducedMotion && (
                <button
                  type="button"
                  aria-label={paused ? "Retomar rotação automática dos banners" : "Pausar rotação automática dos banners"}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                  className="absolute bottom-3 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background sm:bottom-5 sm:right-4"
                >
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
