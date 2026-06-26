"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuoteCart, type QuoteCartItem } from "@/shared/context/QuoteCartContext";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";
import { trackEvent } from "@/lib/analytics";
import { CUSTOMIZATION_METHOD_LABELS } from "@/lib/customization-methods";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const tierLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  MEDIO: "Médio",
  ALTO: "Alto",
};

// Faixa de volume aplicada dinamicamente conforme a quantidade do item — quanto
// maior o pedido, melhor a condição negociada com o time comercial.
function volumeBand(quantity: number): { label: string; hint: string } {
  if (quantity >= 1000) return { label: "Volume alto", hint: "Melhor preço unitário por escala." };
  if (quantity >= 250) return { label: "Volume médio", hint: "Condição intermediária de preço." };
  return { label: "Volume de entrada", hint: "Aumente a quantidade para reduzir o unitário." };
}

export default function QuoteCartPage() {
  const router = useRouter();
  const { items, hydrated, count, totalEstimate, updateQuantity, removeItem, clear } = useQuoteCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentObrigatorio, setConsentObrigatorio] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Seu carrinho de orçamentos está vazio.");
      return;
    }
    if (!consentObrigatorio) {
      setError("É necessário aceitar o Aviso de Privacidade e os Termos de Uso para enviar o orçamento.");
      return;
    }
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        quantidade: i.quantity,
        customizationText: i.customizationText,
        logoUrl: i.logoUrl,
        logoFilename: i.logoFilename,
        metodo: i.customizationMethod ? [i.customizationMethod] : [],
        cor: i.color,
      })),
      cnpj: String(form.get("cnpj") || ""),
      empresa: String(form.get("empresa") || ""),
      clienteNome: String(form.get("clienteNome") || ""),
      email: String(form.get("email") || ""),
      telefone: String(form.get("telefone") || ""),
      cidade: String(form.get("cidade") || ""),
      observacoes: String(form.get("observacoes") || ""),
      consentObrigatorio,
      consentMarketing,
      consentVersion: LEGAL_TERMS_VERSION,
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível enviar o orçamento.");
      }
      trackEvent("complete_quote", {
        lead_source: "cart",
        item_count: items.length,
        ...(totalEstimate ? { value: Number(totalEstimate.toFixed(2)), currency: "BRL" } : {}),
      });
      clear();
      router.push("/orcamento/sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="container-premium py-24 text-center text-muted-foreground">Carregando seu orçamento…</div>
    );
  }

  if (count === 0) {
    return (
      <div className="container-premium flex flex-col items-center py-24 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Seu carrinho de orçamentos está vazio</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Adicione produtos com a sua personalização e feche tudo em uma única cotação.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-premium py-16">
      <Link href="/produtos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Continuar adicionando produtos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Revisar meu orçamento</h1>
      <p className="mt-2 text-muted-foreground">
        {count} {count === 1 ? "produto" : "produtos"} · ajuste as quantidades e finalize em uma cotação única.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Lista de itens */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                onQty={(q) => updateQuantity(item.productId, q)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </AnimatePresence>

          {totalEstimate != null && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <span className="text-muted-foreground">Estimativa de referência (sujeita à proposta final)</span>
              <span className="text-lg font-semibold">{brl.format(totalEstimate)}</span>
            </div>
          )}
        </div>

        {/* Formulário unificado de dados da empresa */}
        <form onSubmit={handleSubmit} className="h-fit space-y-5 rounded-xl border border-border p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Dados da empresa</h2>

          <div>
            <Label htmlFor="empresa">Razão social</Label>
            <Input id="empresa" name="empresa" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" required className="mt-2" placeholder="00.000.000/0000-00" />
          </div>
          <div>
            <Label htmlFor="clienteNome">Nome do comprador</Label>
            <Input id="clienteNome" name="clienteNome" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="email">E-mail do comprador</Label>
            <Input id="email" name="email" type="email" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" name="telefone" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="cidade">Cidade (opcional)</Label>
            <Input id="cidade" name="cidade" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="observacoes">Observações gerais (opcional)</Label>
            <Textarea id="observacoes" name="observacoes" className="mt-2" placeholder="Prazo desejado, detalhes de entrega, etc." />
          </div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={consentObrigatorio}
              onCheckedChange={(c) => setConsentObrigatorio(c === true)}
              aria-required="true"
              className="mt-0.5"
            />
            <span>
              Li e aceito o{" "}
              <Link href="/politica-de-privacidade" className="font-medium text-foreground underline">Aviso de Privacidade</Link>{" "}
              e os{" "}
              <Link href="/termos-de-uso" className="font-medium text-foreground underline">Termos de Uso</Link>.
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={consentMarketing}
              onCheckedChange={(c) => setConsentMarketing(c === true)}
              className="mt-0.5"
            />
            <span>Autorizo a Paint Colors a utilizar meus dados para contato comercial.</span>
          </label>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading || !consentObrigatorio}>
            {loading ? "Enviando…" : "Fechar orçamento"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CartLine({
  item,
  onQty,
  onRemove,
}: {
  item: QuoteCartItem;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const band = volumeBand(item.quantity);
  const lineTotal = item.unitPrice != null ? item.unitPrice * item.quantity : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="flex gap-4 rounded-xl border border-border p-4"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt={item.name} className="h-24 w-24 shrink-0 rounded-lg object-contain" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/produto/${item.slug}`} className="font-medium hover:underline">
            {item.name}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${item.name}`}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {item.priceTier && <Badge variant="outline">Faixa {tierLabels[item.priceTier]}</Badge>}
          <Badge variant="accent">{band.label}</Badge>
          {item.customizationMethod && (
            <Badge variant="outline">
              {CUSTOMIZATION_METHOD_LABELS[item.customizationMethod as keyof typeof CUSTOMIZATION_METHOD_LABELS] ??
                item.customizationMethod}
            </Badge>
          )}
          {item.color && <Badge variant="outline">Cor: {item.color}</Badge>}
        </div>
        {item.customizationText && (
          <p className="mt-1 truncate text-xs text-muted-foreground" title={item.customizationText}>
            Personalização: {item.customizationText}
          </p>
        )}
        {item.logoUrl && <p className="mt-1 text-xs text-accent">🎨 Logo anexado: {item.logoFilename}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{band.hint}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border border-border">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => onQty(item.quantity - 50)}
              className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => onQty(Number(e.target.value))}
              aria-label={`Quantidade de ${item.name}`}
              className="w-20 border-x border-border bg-transparent px-2 py-1 text-center text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => onQty(item.quantity + 50)}
              className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {lineTotal != null && <span className="text-sm font-semibold">{brl.format(lineTotal)}</span>}
        </div>
      </div>
    </motion.div>
  );
}
