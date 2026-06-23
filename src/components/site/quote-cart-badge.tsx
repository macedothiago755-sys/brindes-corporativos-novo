"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useQuoteCart } from "@/shared/context/QuoteCartContext";
import { cn } from "@/lib/utils";

export function QuoteCartBadge({ className }: { className?: string }) {
  const { count, hydrated } = useQuoteCart();
  const prefersReducedMotion = useReducedMotion();

  // Evita layout shift/flash antes de hidratar o localStorage.
  if (!hydrated || count === 0) {
    return (
      <Link
        href="/orcamento/carrinho"
        aria-label="Meu orçamento"
        className={cn(
          "relative inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground",
          className
        )}
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Meu orçamento</span>
      </Link>
    );
  }

  return (
    <Link
      href="/orcamento/carrinho"
      aria-label={`Meu orçamento, ${count} ${count === 1 ? "item" : "itens"}`}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/10",
        className
      )}
    >
      <ShoppingBag className="h-4 w-4 text-accent" />
      <span className="hidden sm:inline">Meu orçamento ({count} {count === 1 ? "item" : "itens"})</span>
      <AnimatePresence>
        <motion.span
          key={count}
          initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground sm:hidden"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </Link>
  );
}
