"use client";

import { resolveColorSwatch } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ColorSwatchesProps {
  colors: string[];
  selected?: string;
  onSelect?: (color: string) => void;
  size?: "sm" | "md";
}

// Lê as cores diretamente de `colors` (Product.colors, cadastrado no admin) —
// nenhuma cor fixa no componente. Produtos sem cores cadastradas simplesmente
// não renderizam nada (colors.length === 0).
export function ColorSwatches({ colors, selected, onSelect, size = "md" }: ColorSwatchesProps) {
  if (!colors || colors.length === 0) return null;

  const dimClass = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <div className="flex flex-wrap gap-2" role={onSelect ? "radiogroup" : undefined}>
      {colors.map((name) => {
        const swatch = resolveColorSwatch(name);
        const isSelected = selected === name;
        const background = swatch.secondary
          ? `linear-gradient(135deg, ${swatch.primary} 50%, ${swatch.secondary} 50%)`
          : swatch.primary;

        if (!onSelect) {
          return (
            <span
              key={name}
              title={name}
              aria-label={name}
              className={cn(dimClass, "rounded-full border-2 border-border shadow-sm")}
              style={{ background }}
            />
          );
        }

        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={name}
            title={name}
            onClick={() => onSelect(name)}
            className={cn(
              dimClass,
              "cursor-pointer rounded-full border-2 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
              isSelected ? "border-accent ring-2 ring-accent/40" : "border-border"
            )}
            style={{ background }}
          />
        );
      })}
    </div>
  );
}
