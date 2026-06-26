"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export interface PricingItem {
  id: string;
  productName: string;
  quantidade: number;
  precoUnitario: number | null;
  cores: string[];
  personalizacao: string[];
}

export function QuoteItemsPricing({ quoteId, items }: { quoteId: string; items: PricingItem[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  // Mantém o valor digitado por item como string (controlado), começando do
  // preço salvo no banco.
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.precoUnitario != null ? String(i.precoUnitario) : ""]))
  );

  const parsed = useMemo(
    () =>
      items.map((i) => {
        const raw = prices[i.id] ?? "";
        const value = raw === "" ? 0 : Number(raw.replace(",", "."));
        const invalid = raw !== "" && (!Number.isFinite(value) || value < 0);
        return { item: i, value, invalid, lineTotal: value * i.quantidade };
      }),
    [items, prices]
  );

  const grandTotal = parsed.reduce((acc, p) => acc + (p.invalid ? 0 : p.lineTotal), 0);
  const hasInvalid = parsed.some((p) => p.invalid);

  async function handleSave() {
    if (hasInvalid) {
      toast.error("Há preços inválidos. Use apenas valores positivos.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: parsed.map((p) => ({ itemId: p.item.id, unitPrice: p.value })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível salvar os preços.");
      }
      toast.success("Preços salvos com sucesso.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-border p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Precificação dos produtos</p>
        <span className="text-sm text-muted-foreground">
          Total da proposta: <span className="font-semibold text-foreground">{brl.format(grandTotal)}</span>
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {parsed.map(({ item, invalid, lineTotal }) => (
          <div key={item.id} className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[1fr_160px_160px]">
            <div className="min-w-0">
              <p className="font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantidade} un.
                {item.cores.length > 0 ? ` · ${item.cores.join(", ")}` : ""}
                {item.personalizacao.length > 0 ? ` · ${item.personalizacao.join(", ")}` : ""}
              </p>
            </div>

            <div>
              <Label htmlFor={`preco-${item.id}`}>Preço unitário (R$)</Label>
              <Input
                id={`preco-${item.id}`}
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={prices[item.id] ?? ""}
                onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                aria-invalid={invalid}
                className="mt-2"
                placeholder="0,00"
              />
              {invalid && <p className="mt-1 text-xs text-destructive">Valor inválido.</p>}
            </div>

            <div>
              <Label>Valor total do item</Label>
              <div className="mt-2 flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 text-sm font-semibold">
                {invalid ? "—" : brl.format(lineTotal)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving || hasInvalid}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Salvar Preços
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
