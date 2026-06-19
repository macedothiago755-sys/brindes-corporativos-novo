import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  sort?: string;
  dir?: "asc" | "desc";
  buildSortHref?: (key: string, dir: "asc" | "desc") => string;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({ columns, rows, getRowId, sort, dir, buildSortHref, emptyState }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        {emptyState ?? "Nenhum registro encontrado."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            {columns.map((col) => {
              const isSorted = sort === col.key;
              const nextDir = isSorted && dir === "asc" ? "desc" : "asc";
              const Icon = isSorted ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

              return (
                <th key={col.key} className={cn("px-4 py-3 font-medium", col.className)}>
                  {col.sortable && buildSortHref ? (
                    <Link
                      href={buildSortHref(col.key, nextDir)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      <Icon className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)} className="border-t border-border hover:bg-muted/50">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
