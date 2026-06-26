import { Input } from "@/components/ui/input";

interface SelectFilter {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
}

interface TableToolbarProps {
  action: string;
  searchName?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  filters?: SelectFilter[];
  hiddenFields?: Record<string, string | undefined>;
}

export function TableToolbar({
  action,
  searchName = "q",
  searchPlaceholder = "Buscar...",
  searchValue,
  filters = [],
  hiddenFields = {},
}: TableToolbarProps) {
  return (
    <form action={action} method="GET" className="flex flex-wrap items-end gap-3 rounded-xl border border-border p-4">
      {Object.entries(hiddenFields).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null
      )}
      <div className="min-w-[200px] flex-1">
        <Input name={searchName} defaultValue={searchValue} placeholder={searchPlaceholder} />
      </div>
      {filters.map((filter) => (
        <select
          key={filter.name}
          name={filter.name}
          defaultValue={filter.value ?? ""}
          className="h-11 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      <button type="submit" className="h-11 rounded-md border border-border px-4 text-sm hover:bg-muted">
        Filtrar
      </button>
    </form>
  );
}
