"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/site/product-card";

export function FeaturedProductsCarousel({ products }: { products: ProductCardData[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[80%] flex-shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Produtos anteriores"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 hidden -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background p-2 shadow-sm transition hover:bg-muted sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Próximos produtos"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 hidden translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background p-2 shadow-sm transition hover:bg-muted sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
