"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Banner = {
  /** Imagem para desktop/tablet (proporção 1920x600). */
  desktop: string;
  /** Imagem para mobile (proporção 1014x535). */
  mobile: string;
  alt: string;
  /** Link opcional ao clicar no banner. */
  href?: string;
};

// NOTA: placeholders temporários usando as imagens existentes.
// Trocar pelos 3 banners premium definitivos (desktop + mobile) quando disponíveis.
const banners: Banner[] = [
  {
    desktop: "/banners/banner-3-garrafa-1920x600.jpg",
    mobile: "/banners/banner-3-garrafa-1014x535.jpg",
    alt: "Garrafas térmicas personalizadas para empresas",
    href: "/produtos?categoria=squeezes-e-garrafas",
  },
  {
    desktop: "/banners/banner-6-churrasco-1920x600.jpg",
    mobile: "/banners/banner-6-churrasco-1014x535.jpg",
    alt: "Kit churrasco personalizado para brindes corporativos",
    href: "/produtos?categoria=kit-churrasco",
  },
  {
    desktop: "/banners/banner-5-caderno-1920x600.jpg",
    mobile: "/banners/banner-5-caderno-1014x535.jpg",
    alt: "Cadernos e cadernetas personalizados com a marca da empresa",
    href: "/produtos?categoria=blocos-e-cadernetas",
  },
];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(timer);
  }, [index, goTo]);

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative overflow-hidden bg-muted"
    >
      {/* Proporção responsiva: mais alto no mobile, panorâmico no desktop */}
      <div className="relative aspect-[1014/535] w-full sm:aspect-[1920/600]">
        {banners.map((banner, i) => {
          const className = cn(
            "absolute inset-0 block transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          );
          const content = (
            <>
              {/* Mobile */}
              <Image
                src={banner.mobile}
                alt={banner.alt}
                fill
                priority={i === 0}
                className="object-cover sm:hidden"
                sizes="100vw"
              />
              {/* Desktop / tablet */}
              <Image
                src={banner.desktop}
                alt={banner.alt}
                fill
                priority={i === 0}
                className="hidden object-cover sm:block"
                sizes="100vw"
              />
            </>
          );

          return banner.href ? (
            <Link
              key={banner.desktop}
              href={banner.href}
              aria-hidden={i !== index}
              tabIndex={i === index ? 0 : -1}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <div key={banner.desktop} aria-hidden={i !== index} className={className}>
              {content}
            </div>
          );
        })}
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

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
            {banners.map((banner, i) => (
              <button
                key={banner.desktop}
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
        </>
      )}
    </section>
  );
}
