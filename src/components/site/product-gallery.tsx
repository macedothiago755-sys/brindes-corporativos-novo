"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2 } from "lucide-react";
import { cn, isExternalImage } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : ["/products/placeholder-1.svg"];
  const [active, setActive] = useState(0);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);

  const count = gallery.length;
  const go = useCallback(
    (next: number) => setActive((prev) => (next + count) % count),
    [count]
  );

  // Swipe (touch) handling
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(active + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  const src = gallery[active];

  return (
    <div className="space-y-4">
      {/* Imagem principal */}
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-border bg-muted"
        onMouseEnter={() => setHoverZoom(true)}
        onMouseLeave={() => setHoverZoom(false)}
        onMouseMove={onMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setLightbox(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          unoptimized={isExternalImage(src)}
          sizes="(min-width: 1024px) 600px, 100vw"
          className={cn(
            "object-cover transition-transform duration-200 ease-out",
            hoverZoom ? "scale-[1.8]" : "scale-100"
          )}
          style={{ transformOrigin: origin }}
        />

        {/* Dica de zoom */}
        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" /> Ampliar
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={(e) => {
                e.stopPropagation();
                go(active - 1);
              }}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={(e) => {
                e.stopPropagation();
                go(active + 1);
              }}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {count > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {gallery.slice(0, 10).map((thumb, i) => (
            <button
              key={thumb + i}
              type="button"
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border bg-muted transition",
                i === active ? "border-accent ring-2 ring-accent/40" : "border-border hover:border-foreground/40"
              )}
            >
              <Image
                src={thumb}
                alt={`${alt} — miniatura ${i + 1}`}
                fill
                unoptimized={isExternalImage(thumb)}
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox
          images={gallery}
          alt={alt}
          index={active}
          onIndex={setActive}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  alt,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const count = images.length;
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      setZoomed(false);
      onIndex((next + count) % count);
    },
    [count, onIndex]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, go, onClose]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  const src = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className={cn("relative h-[82vh] w-[92vw] max-w-5xl overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
        onClick={(e) => {
          e.stopPropagation();
          setZoomed((z) => !z);
        }}
        onMouseMove={onMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={isExternalImage(src)}
          sizes="92vw"
          className={cn("object-contain transition-transform duration-200 ease-out", zoomed ? "scale-[2.2]" : "scale-100")}
          style={{ transformOrigin: origin }}
        />
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Imagem anterior"
            onClick={(e) => {
              e.stopPropagation();
              go(index - 1);
            }}
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            aria-label="Próxima imagem"
            onClick={(e) => {
              e.stopPropagation();
              go(index + 1);
            }}
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            <Maximize2 className="h-4 w-4" />
            {index + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}
