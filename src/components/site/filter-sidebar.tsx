"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

  return (
    <aside className="space-y-8">
      <div>
        <p className="text-sm font-semibold">Categoria</p>
        <div className="mt-3 flex max-h-[480px] flex-col gap-1 overflow-y-auto pr-2">
          {categories.map((c) => (
            <div key={c.slug}>
              <button
                onClick={() => toggleParam("categoria", c.slug)}
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

      {(activeCategory || activeMethod) && (
        <button onClick={() => router.push("/produtos")} className="text-sm text-accent underline">
          Limpar filtros
        </button>
      )}
    </aside>
  );
}
