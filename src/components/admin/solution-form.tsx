"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const OBJECTIVES = [
  { value: "", label: "Sem objetivo específico" },
  { value: "ONBOARDING", label: "Onboarding de colaboradores" },
  { value: "EVENTO", label: "Evento corporativo" },
  { value: "CLIENTE_VIP", label: "Presente cliente VIP" },
  { value: "FEIRA", label: "Feira" },
  { value: "PREMIACAO", label: "Premiação / Ação promocional" },
];

type ProductOption = { id: string; name: string };

export function SolutionForm({
  action,
  products,
  submitLabel,
  initial,
}: {
  action: (formData: FormData) => void;
  products: ProductOption[];
  submitLabel: string;
  initial?: {
    title: string;
    description: string;
    image: string | null;
    ctaLabel: string | null;
    objective: string | null;
    productIds: string[];
  };
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required className="mt-2" defaultValue={initial?.title} />
        </div>
        <div>
          <Label htmlFor="objective">Objetivo associado</Label>
          <select
            id="objective"
            name="objective"
            defaultValue={initial?.objective ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-border bg-background px-4 text-sm"
          >
            {OBJECTIVES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" required className="mt-2" defaultValue={initial?.description} />
        </div>
        <div>
          <Label htmlFor="image">URL da imagem</Label>
          <Input id="image" name="image" className="mt-2" defaultValue={initial?.image ?? ""} />
        </div>
        <div>
          <Label htmlFor="ctaLabel">Texto do botão</Label>
          <Input id="ctaLabel" name="ctaLabel" className="mt-2" placeholder="Solicitar orçamento" defaultValue={initial?.ctaLabel ?? ""} />
        </div>
      </div>

      <div>
        <Label>Produtos relacionados</Label>
        <div className="mt-2 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-border p-3">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <Checkbox name="productId" value={p.id} defaultChecked={initial?.productIds.includes(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
