"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const OBJECTIVES = [
  { value: "", label: "Sem objetivo específico" },
  { value: "ONBOARDING", label: "Onboarding de colaboradores" },
  { value: "EVENTO", label: "Evento corporativo" },
  { value: "CLIENTE_VIP", label: "Presente cliente VIP" },
  { value: "FEIRA", label: "Feira" },
  { value: "PREMIACAO", label: "Premiação / Ação promocional" },
];

type ProductOption = { id: string; name: string };

export function KitForm({
  action,
  products,
  submitLabel,
  initial,
}: {
  action: (formData: FormData) => void;
  products: ProductOption[];
  submitLabel: string;
  initial?: {
    name: string;
    description: string | null;
    image: string | null;
    objective: string | null;
    active: boolean;
    estimatedPricePerPerson: number | null;
    items: { productId: string; quantityPerPerson: number }[];
  };
}) {
  const [items, setItems] = useState(
    initial?.items.length ? initial.items : [{ productId: products[0]?.id ?? "", quantityPerPerson: 1 }]
  );

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome do kit</Label>
          <Input id="name" name="name" required className="mt-2" defaultValue={initial?.name} />
        </div>
        <div>
          <Label htmlFor="objective">Objetivo</Label>
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
          <Textarea id="description" name="description" className="mt-2" defaultValue={initial?.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="image">URL da imagem</Label>
          <Input id="image" name="image" className="mt-2" defaultValue={initial?.image ?? ""} />
        </div>
        <div>
          <Label htmlFor="estimatedPricePerPerson">Preço estimado por pessoa (R$)</Label>
          <Input
            id="estimatedPricePerPerson"
            name="estimatedPricePerPerson"
            type="number"
            step="0.01"
            className="mt-2"
            defaultValue={initial?.estimatedPricePerPerson ?? ""}
          />
        </div>
        {initial && (
          <div className="flex items-center gap-2 pt-7">
            <input id="active" name="active" type="checkbox" defaultChecked={initial.active} className="h-4 w-4" />
            <Label htmlFor="active">Kit ativo</Label>
          </div>
        )}
      </div>

      <div>
        <Label>Produtos do kit</Label>
        <div className="mt-2 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <select
                name="itemProductId"
                defaultValue={item.productId}
                className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Input
                name="itemQuantity"
                type="number"
                min={1}
                defaultValue={item.quantityPerPerson}
                className="w-32"
                placeholder="Qtd/pessoa"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setItems([...items, { productId: products[0]?.id ?? "", quantityPerPerson: 1 }])}
        >
          <Plus className="h-4 w-4" /> Adicionar produto
        </Button>
      </div>

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
