"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface CategoryOption {
  id: string;
  name: string;
  parentId?: string | null;
}

interface SelectionContextValue {
  selected: Set<string>;
  toggle: (id: string) => void;
  toggleAll: () => void;
  allSelected: boolean;
  clear: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("Este componente precisa estar dentro de um SelectionProvider.");
  return ctx;
}

export function SelectionProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));

  const value = useMemo<SelectionContextValue>(
    () => ({
      selected,
      toggle: (id) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      toggleAll: () => setSelected(allSelected ? new Set() : new Set(ids)),
      allSelected,
      clear: () => setSelected(new Set()),
    }),
    [selected, ids, allSelected]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function SelectAllCheckbox() {
  const { allSelected, toggleAll } = useSelection();
  return <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar todos" />;
}

export function RowCheckbox({ id }: { id: string }) {
  const { selected, toggle } = useSelection();
  return (
    <input
      type="checkbox"
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      aria-label="Selecionar produto"
    />
  );
}

export function BulkActionBar({
  categories,
  bulkUpdateAction,
}: {
  categories: CategoryOption[];
  bulkUpdateAction: (formData: FormData) => Promise<void>;
}) {
  const { selected, clear } = useSelection();

  // Cascata Categoria → Subcategoria para a edição em massa, no mesmo padrão
  // usado no formulário individual de produto (ver product-form.tsx).
  const parentCategories = categories.filter((c) => !c.parentId);
  const childrenOf = (parentId: string) => categories.filter((c) => c.parentId === parentId);
  const [bulkParentId, setBulkParentId] = useState("");
  const [bulkSubId, setBulkSubId] = useState("");
  const bulkSubcategories = bulkParentId ? childrenOf(bulkParentId) : [];
  // Vazio = "não alterar categoria" para os produtos selecionados.
  const effectiveBulkCategoryId = bulkSubId || bulkParentId;

  if (selected.size === 0) return null;

  return (
    <form
      action={async (formData) => {
        await bulkUpdateAction(formData);
        clear();
        setBulkParentId("");
        setBulkSubId("");
      }}
      className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted p-3"
    >
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="productId" value={id} />
      ))}
      <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
      <select
        value={bulkParentId}
        onChange={(e) => {
          setBulkParentId(e.target.value);
          setBulkSubId("");
        }}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option value="">Alterar categoria...</option>
        {parentCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={bulkSubId}
        onChange={(e) => setBulkSubId(e.target.value)}
        disabled={bulkSubcategories.length === 0}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs disabled:opacity-50"
      >
        <option value="">{bulkSubcategories.length === 0 ? "Sem subcategoria" : "Alterar subcategoria..."}</option>
        {bulkSubcategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input type="hidden" name="categoryId" value={effectiveBulkCategoryId} />
      <input
        type="text"
        name="brand"
        placeholder="Alterar marca..."
        className="h-9 w-36 rounded-md border border-border bg-background px-2 text-xs"
      />
      <select name="status" defaultValue="" className="h-9 rounded-md border border-border bg-background px-2 text-xs">
        <option value="">Alterar status...</option>
        <option value="ATIVO">Ativo</option>
        <option value="RASCUNHO">Rascunho</option>
        <option value="INDISPONIVEL">Indisponível</option>
      </select>
      <input
        type="text"
        name="addTags"
        placeholder="Adicionar tags (vírgula)"
        className="h-9 w-44 rounded-md border border-border bg-background px-2 text-xs"
      />
      <input
        type="text"
        name="removeTags"
        placeholder="Remover tags (vírgula)"
        className="h-9 w-44 rounded-md border border-border bg-background px-2 text-xs"
      />
      <Button type="submit" size="sm">
        Aplicar
      </Button>
    </form>
  );
}
