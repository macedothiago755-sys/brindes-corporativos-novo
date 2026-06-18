"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

const categories: Option[] = [
  { label: "Escritório", value: "escritorio" },
  { label: "Tecnologia", value: "tecnologia" },
  { label: "Utilidades", value: "utilidades" },
  { label: "Eventos", value: "eventos" },
  { label: "Kits Corporativos", value: "kits-corporativos" },
  { label: "Sustentáveis", value: "sustentaveis" },
  { label: "Premium", value: "premium" },
];

const methods: Option[] = [
  { label: "Gravação a laser", value: "GRAVACAO_LASER" },
  { label: "Silk screen", value: "SILK_SCREEN" },
  { label: "Bordado", value: "BORDADO" },
  { label: "Impressão UV", value: "IMPRESSAO_UV" },
  { label: "Transfer", value: "TRANSFER" },
];

export function FilterSidebar() {
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
        <div className="mt-3 flex flex-col gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => toggleParam("categoria", c.value)}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                activeCategory === c.value && "bg-foreground text-background"
              )}
            >
              {c.label}
            </button>
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
