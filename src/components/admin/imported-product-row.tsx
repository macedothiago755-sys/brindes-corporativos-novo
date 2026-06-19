"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ImportedProductRowProduct {
  id: string;
  sourceUrl: string;
  nome: string;
  codigo: string | null;
  sku: string | null;
  marca: string | null;
  categoria: string | null;
  descricaoCurta: string | null;
  descricaoLonga: string | null;
  descricaoIA: string | null;
  preco: number | null;
  imagemPrincipal: string | null;
  status: string;
  dadosTecnicos: unknown;
}

interface CategoryOption {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  IMPORTADO: "Aguardando revisão",
  ERRO: "Erro",
  PROMOVIDO: "Importado",
  IGNORADO: "Ignorado",
};

const STATUS_VARIANTS: Record<string, "success" | "default" | "destructive" | "outline"> = {
  IMPORTADO: "default",
  ERRO: "destructive",
  PROMOVIDO: "success",
  IGNORADO: "outline",
};

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface ImportedProductRowProps {
  product: ImportedProductRowProduct;
  categories: CategoryOption[];
  suggestedCategoryId?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelected?: () => void;
  enhanceAction: () => void | Promise<void>;
  promoteAction: (formData: FormData) => void | Promise<void>;
  ignoreAction: () => void | Promise<void>;
  restoreAction: () => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
}

export function ImportedProductRow({
  product,
  categories,
  suggestedCategoryId,
  selectable = false,
  selected = false,
  onToggleSelected,
  enhanceAction,
  promoteAction,
  ignoreAction,
  restoreAction,
  updateAction,
}: ImportedProductRowProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const cores = ((product.dadosTecnicos as Record<string, string> | null) ?? {}).cor;
  const colorCount = cores ? cores.split(",").map((c) => c.trim()).filter(Boolean).length : 0;

  if (mode === "edit") {
    return (
      <tr className="border-t border-border bg-muted/40">
        <td colSpan={7} className="px-4 py-4">
          <form
            action={async (formData) => {
              await updateAction(formData);
              setMode("view");
            }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <Label htmlFor={`nome-${product.id}`}>Nome</Label>
              <Input id={`nome-${product.id}`} name="nome" defaultValue={product.nome} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor={`codigo-${product.id}`}>Código</Label>
              <Input id={`codigo-${product.id}`} name="codigo" defaultValue={product.codigo ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor={`sku-${product.id}`}>SKU</Label>
              <Input id={`sku-${product.id}`} name="sku" defaultValue={product.sku ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor={`marca-${product.id}`}>Marca</Label>
              <Input id={`marca-${product.id}`} name="marca" defaultValue={product.marca ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor={`categoria-${product.id}`}>Categoria (texto do fornecedor)</Label>
              <Input id={`categoria-${product.id}`} name="categoria" defaultValue={product.categoria ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor={`preco-${product.id}`}>Preço de referência</Label>
              <Input
                id={`preco-${product.id}`}
                name="preco"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.preco ?? ""}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor={`descricaoCurta-${product.id}`}>Descrição curta</Label>
              <Textarea
                id={`descricaoCurta-${product.id}`}
                name="descricaoCurta"
                defaultValue={product.descricaoCurta ?? ""}
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit" size="sm">
                Salvar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setMode("view")}>
                Cancelar
              </Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-3">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            aria-label={`Selecionar ${product.nome}`}
          />
        )}
      </td>
      <td className="px-4 py-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
          {product.imagemPrincipal && (
            <Image src={product.imagemPrincipal} alt={product.nome} fill className="object-cover" unoptimized />
          )}
        </div>
      </td>
      <td className="px-4 py-3 font-medium">
        <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {product.nome}
        </a>
        <p className="mt-1 max-w-[260px] truncate text-xs text-muted-foreground">
          {product.descricaoIA || product.descricaoCurta || product.descricaoLonga || "—"}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {product.preco != null && <span>{priceFormatter.format(product.preco)}</span>}
          {colorCount > 0 && (
            <span>{colorCount} {colorCount === 1 ? "cor disponível" : "cores disponíveis"}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">{product.codigo || product.sku || "—"}</td>
      <td className="px-4 py-3">{product.categoria || "—"}</td>
      <td className="px-4 py-3">
        <Badge variant={STATUS_VARIANTS[product.status] ?? "default"}>
          {STATUS_LABELS[product.status] ?? product.status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMode("edit")}>
              Editar
            </Button>
            {!product.descricaoIA && product.status !== "PROMOVIDO" && (
              <form action={enhanceAction}>
                <Button type="submit" variant="outline" size="sm">
                  Melhorar descrição
                </Button>
              </form>
            )}
            {product.status === "IGNORADO" ? (
              <form action={restoreAction}>
                <Button type="submit" variant="outline" size="sm">
                  Reativar
                </Button>
              </form>
            ) : (
              product.status !== "PROMOVIDO" && (
                <form action={ignoreAction}>
                  <Button type="submit" variant="outline" size="sm">
                    Ignorar
                  </Button>
                </form>
              )
            )}
          </div>
          {product.status !== "PROMOVIDO" && product.status !== "IGNORADO" && (
            <form action={promoteAction} className="flex items-center gap-2">
              <select
                name="categoryId"
                required
                defaultValue={suggestedCategoryId ?? ""}
                className="h-9 rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="">Categoria...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm">
                Importar
              </Button>
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}
