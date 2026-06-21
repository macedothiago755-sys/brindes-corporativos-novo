"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };
export type CategoryOption = { name: string; slug: string; children: { name: string; slug: string }[] };

const methods: Option[] = [
  { label: "Gravação a laser", value: "GRAVACAO_LASER" },
  { label: "Silk screen", value: "SILK_SCREEN" },
  { label: "Bordado", value: "BORDADO" },
  { label: "Impressão UV", value: "IMPRESSAO_UV" },
  { label: "Transfer", value: "TRANSFER" },
];

const tags: Option[] = [
  { label: "Lançamento", value: "lançamento" },
  { label: "Promoção", value: "promoção" },
  { label: "Mais vendido", value: "mais vendido" },
  { label: "Brinde", value: "brinde" },
  { label: "Corporativo", value: "corporativo" },
  { label: "Personalizado", value: "personalizado" },
];

export function FilterSidebar({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggleParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);
    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/produtos?${params.toString()}`);
  }

  const activeCategory = searchParams.get("categoria");
  const activeMethod = searchParams.get("metodo");
  const activeTag = searchParams.get("tag");
  const activeQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(activeQuery);

  function submitSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    router.push(`/produtos?${params.toString()}`);
  }

  return (
    <aside className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
        role="search"
      >
        <p className="text-sm font-semibold">Buscar</p>
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou termo..."
            aria-label="Buscar produtos"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => {
                setQuery("");
                submitSearch("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      <div>
        <p className="text-sm font-semibold">Categoria</p>
        <div className="mt-3 flex max-h-[480px] flex-col gap-1 overflow-y-auto pr-2">
          {categories.map((c) => (
            <div key={c.slug}>
              <button
                onClick={() => toggleParam("categoria", c.slug)}
                aria-pressed={activeCategory === c.slug}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-muted",
                  activeCategory === c.slug && "bg-foreground text-background"
                )}
              >
                {c.name}
              </button>
              {c.children.length > 0 && (
                <div className="ml-3 flex flex-col gap-1 border-l border-border pl-2">
                  {c.children.map((child) => (
                    <button
                      key={child.slug}
                      onClick={() => toggleParam("categoria", child.slug)}
                      aria-pressed={activeCategory === child.slug}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted",
                        activeCategory === child.slug && "bg-foreground text-background"
                      )}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Personalização</p>
        <div className="mt-3 flex flex-col gap-2">
          {methods.map((m) => (
            <button
              key={m.value}
              onClick={() => toggleParam("metodo", m.value)}
              aria-pressed={activeMethod === m.value}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                activeMethod === m.value && "bg-foreground text-background"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Tags</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleParam("tag", t.value)}
              aria-pressed={activeTag === t.value}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted",
                activeTag === t.value && "bg-foreground text-background"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {(activeCategory || activeMethod || activeTag || activeQuery) && (
        <button
          onClick={() => {
            setQuery("");
            router.push("/produtos");
          }}
          className="text-sm text-accent underline"
        >
          Limpar filtros
        </button>
      )}
    </aside>
  );
}
