"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImportedProductRow } from "@/components/admin/imported-product-row";

interface CategoryOption {
  id: string;
  name: string;
}

interface ImportedProductForTable {
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
  suggestedCategoryId?: string;
}

interface ImportedProductsTableProps {
  products: ImportedProductForTable[];
  categories: CategoryOption[];
  emptyState: string;
  enhanceAction: (productId: string) => Promise<void>;
  promoteAction: (productId: string, formData: FormData) => Promise<void>;
  ignoreAction: (productId: string) => Promise<void>;
  restoreAction: (productId: string) => Promise<void>;
  updateAction: (productId: string, formData: FormData) => Promise<void>;
  bulkPromoteAction: (formData: FormData) => Promise<void>;
}

export function ImportedProductsTable({
  products,
  categories,
  emptyState,
  enhanceAction,
  promoteAction,
  ignoreAction,
  restoreAction,
  updateAction,
  bulkPromoteAction,
}: ImportedProductsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const selectableIds = useMemo(
    () => products.filter((p) => p.status !== "PROMOVIDO" && p.status !== "IGNORADO").map((p) => p.id),
    [products]
  );

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectableIds));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {selectableIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted p-3">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <form
            action={async (formData) => {
              await bulkPromoteAction(formData);
              setSelected(new Set());
            }}
            className="flex items-center gap-2"
          >
            {Array.from(selected).map((id) => (
              <input key={id} type="hidden" name="productId" value={id} />
            ))}
            <select
              name="categoryId"
              required
              value={bulkCategoryId}
              onChange={(e) => setBulkCategoryId(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="">Categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={selected.size === 0}>
              Importar selecionados
            </Button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="w-10 px-4 py-3">
                {selectableIds.length > 0 && (
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar todos" />
                )}
              </th>
              <th className="px-4 py-3">Imagem</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ImportedProductRow
                key={product.id}
                product={product}
                categories={categories}
                suggestedCategoryId={product.suggestedCategoryId}
                selectable={product.status !== "PROMOVIDO" && product.status !== "IGNORADO"}
                selected={selected.has(product.id)}
                onToggleSelected={() => toggleOne(product.id)}
                enhanceAction={enhanceAction.bind(null, product.id)}
                promoteAction={promoteAction.bind(null, product.id)}
                ignoreAction={ignoreAction.bind(null, product.id)}
                restoreAction={restoreAction.bind(null, product.id)}
                updateAction={updateAction.bind(null, product.id)}
              />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
