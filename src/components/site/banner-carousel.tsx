"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const banners = [
  { src: "/banners/banner-7-copa1-1920x600.jpg", alt: "Seleção de brindes para a Copa do Mundo" },
  { src: "/banners/banner-1-armband-1920x600.jpg", alt: "Braçadeira esportiva personalizada" },
  { src: "/banners/banner-2-bolsa-1920x600.jpg", alt: "Bolsa em tela PVC personalizada" },
  { src: "/banners/banner-3-garrafa-1920x600.jpg", alt: "Garrafa térmica 600ml personalizada" },
  { src: "/banners/banner-6-churrasco-1920x600.jpg", alt: "Kit churrasco personalizado" },
  { src: "/banners/banner-4-squeeze-1920x600.jpg", alt: "Squeeze dobrável em TPU 500ml" },
  { src: "/banners/banner-9-copa2-1920x600.jpg", alt: "Tudo para curtir a Copa do Mundo" },
  { src: "/banners/banner-5-caderno-1920x600.jpg", alt: "Caderno ecológico com caneta" },
  { src: "/banners/banner-8-frasqueira-1920x600.jpg", alt: "Frasqueira plástica 10L" },
];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => goTo(index + 1), 5000);
    return () => clearInterval(timer);
  }, [index, goTo]);

  return (
    <section className="relative overflow-hidden border-b border-border bg-muted">
      <div className="relative aspect-[1920/600] w-full">
        {banners.map((banner, i) => (
          <div
            key={banner.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

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

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
        {banners.map((banner, i) => (
          <button
            key={banner.src}
            type="button"
            aria-label={`Ir para o banner ${i + 1}`}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-accent" : "w-1.5 bg-background/70"
            )}
          />
        ))}
      </div>
    </section>
  );
}
