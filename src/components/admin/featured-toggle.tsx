"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function FeaturedToggle({
  productId,
  initialFeatured,
  productName,
}: {
  productId: string;
  initialFeatured: boolean;
  productName: string;
}) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (pending) return;
    const next = !featured;
    // Atualização otimista — reverte se a API falhar.
    setFeatured(next);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}/featured`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: next }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Não foi possível atualizar o destaque.");
        }
        toast.success(
          next ? `"${productName}" adicionado aos destaques.` : `"${productName}" removido dos destaques.`
        );
      } catch (err) {
        setFeatured(!next);
        toast.error(err instanceof Error ? err.message : "Erro inesperado ao atualizar.");
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={featured}
      aria-label={featured ? "Remover dos destaques" : "Adicionar aos destaques"}
      onClick={toggle}
      disabled={pending}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 ${
        featured ? "bg-accent" : "bg-muted-foreground/30"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ marginLeft: featured ? 22 : 2 }}
      />
    </button>
  );
}
