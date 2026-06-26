"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ProductColorContextValue {
  color?: string;
  setColor: (color?: string) => void;
}

const ProductColorContext = createContext<ProductColorContextValue | null>(null);

export function ProductColorProvider({ children }: { children: ReactNode }) {
  const [color, setColor] = useState<string | undefined>(undefined);
  return <ProductColorContext.Provider value={{ color, setColor }}>{children}</ProductColorContext.Provider>;
}

export function useProductColor() {
  const ctx = useContext(ProductColorContext);
  if (!ctx) throw new Error("useProductColor deve ser usado dentro de ProductColorProvider");
  return ctx;
}
