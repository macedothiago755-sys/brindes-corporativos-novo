"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuoteCart } from "@/shared/context/QuoteCartContext";
import { trackEvent } from "@/lib/analytics";
import { CUSTOMIZATION_METHOD_OPTIONS } from "@/lib/customization-methods";
import { ColorSwatches } from "@/components/site/color-swatches";
import { useProductColor } from "@/shared/context/ProductColorContext";

const MAX_LOGO_SIZE = 10 * 1024 * 1024; // 10MB, alinhado ao /api/upload

interface AddToQuoteCartProps {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice?: number | null;
  priceTier?: "ENTRADA" | "MEDIO" | "ALTO" | null;
  colors?: string[];
}

export function AddToQuoteCart({ productId, slug, name, image, unitPrice, priceTier, colors }: AddToQuoteCartProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { addItem, hasItem, count } = useQuoteCart();
  const { setColor: setGlobalColor } = useProductColor();

  const [quantity, setQuantity] = useState(100);
  const [customizationText, setCustomizationText] = useState("");
  const [customizationMethod, setCustomizationMethod] = useState("");
  const [color, setColor] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasColors = Boolean(colors && colors.length > 0);

  const inCart = hasItem(productId);

  async function handleAdd() {
    setError(null);

    if (!customizationMethod) {
      setError("Selecione o método de personalização.");
      return;
    }

    setAdding(true);

    // Upload do logo (se houver) ANTES de adicionar ao carrinho: persistimos a
    // URL, já que o File não sobrevive ao localStorage. Upload é opcional —
    // falha não bloqueia a adição do item.
    let logoUrl: string | undefined;
    let logoFilename: string | undefined;
    try {
      if (logoFile && logoFile.size > 0) {
        if (logoFile.size > MAX_LOGO_SIZE) {
          setError("O logotipo excede o tamanho máximo de 10MB.");
          setAdding(false);
          return;
        }
        const data = new FormData();
        data.append("file", logoFile);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        if (res.ok) {
          const json = await res.json();
          logoUrl = json.url;
          logoFilename = logoFile.name;
        }
      }
    } catch {
      // segue sem o anexo
    }

    addItem({
      productId,
      slug,
      name,
      image,
      unitPrice: unitPrice ?? null,
      priceTier: priceTier ?? null,
      quantity,
      customizationText: customizationText.trim() || undefined,
      logoUrl,
      logoFilename,
      customizationMethod,
      color: color || undefined,
    });

    trackEvent("start_quote", { product_name: name, quantity, lead_source: "cart" });

    setAdding(false);
    setAdded(true);
    setLogoFile(null);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cart-qty">Quantidade</Label>
          <Input
            id="cart-qty"
            type="number"
            min={1}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="cart-method">Método de personalização</Label>
          <select
            id="cart-method"
            value={customizationMethod}
            onChange={(e) => setCustomizationMethod(e.target.value)}
            required
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {CUSTOMIZATION_METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {hasColors && (
          <div className="sm:col-span-2">
            <Label>Cor desejada {color && <span className="text-muted-foreground">— {color}</span>}</Label>
            <div className="mt-2">
              <ColorSwatches
                colors={colors!}
                selected={color}
                onSelect={(c) => {
                  setColor(c);
                  setGlobalColor(c);
                }}
              />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="cart-logo">Logo/arte (opcional)</Label>
          <Input
            id="cart-logo"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,.pdf,.ai,.eps"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cart-custom">Personalização desejada (opcional)</Label>
          <Input
            id="cart-custom"
            value={customizationText}
            onChange={(e) => setCustomizationText(e.target.value)}
            placeholder="Ex.: logo gravado a laser, cor azul marinho"
            className="mt-2"
          />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <motion.div
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto" onClick={handleAdd} disabled={adding}>
            <AnimatePresence mode="wait" initial={false}>
              {adding ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" /> Adicionando…
                </motion.span>
              ) : added ? (
                <motion.span
                  key="added"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" /> Adicionado!
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {inCart ? "Adicionar mais ao orçamento" : "Adicionar ao Carrinho de Orçamentos"}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {count > 0 && (
          <Button variant="outline-accent" size="lg" onClick={() => router.push("/orcamento/carrinho")}>
            Ver meu orçamento ({count})
          </Button>
        )}
      </div>
    </div>
  );
}
