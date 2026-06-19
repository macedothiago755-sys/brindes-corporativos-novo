"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductsBulkTableProps<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  categories: CategoryOption[];
  getRowId: (row: T) => string;
  sort?: string;
  dir?: "asc" | "desc";
  buildSortHref?: (key: string, dir: "asc" | "desc") => string;
  emptyState?: React.ReactNode;
  bulkUpdateAction: (formData: FormData) => Promise<void>;
}

export function ProductsBulkTable<T extends { id: string }>({
  rows,
  columns,
  categories,
  getRowId,
  sort,
  dir,
  buildSortHref,
  emptyState,
  bulkUpdateAction,
}: ProductsBulkTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const ids = useMemo(() => rows.map(getRowId), [rows, getRowId]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(ids));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const fullColumns: Column<T>[] = [
    {
      key: "__select",
      header: <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar todos" />,
      className: "w-10",
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(getRowId(row))}
          onChange={() => toggleOne(getRowId(row))}
          aria-label="Selecionar produto"
        />
      ),
    },
    ...columns,
  ];

  return (
    <div>
      {selected.size > 0 && (
        <form
          action={async (formData) => {
            await bulkUpdateAction(formData);
            setSelected(new Set());
          }}
          className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted p-3"
        >
          {Array.from(selected).map((id) => (
            <input key={id} type="hidden" name="productId" value={id} />
          ))}
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <select name="categoryId" defaultValue="" className="h-9 rounded-md border border-border bg-background px-2 text-xs">
            <option value="">Alterar categoria...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
      )}

      <DataTable
        columns={fullColumns}
        rows={rows}
        getRowId={getRowId}
        sort={sort}
        dir={dir}
        buildSortHref={buildSortHref}
        emptyState={emptyState}
      />
    </div>
  );
}
