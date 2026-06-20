"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, Gift, PartyPopper, Rocket, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, isExternalImage } from "@/lib/utils";
import { getStoredCoupon } from "@/lib/coupon-storage";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";
import type { KitRecommendation } from "@/lib/kit-recommendation";

const objectives = [
  { id: "ONBOARDING", label: "Onboarding de colaboradores", icon: Building2 },
  { id: "EVENTO", label: "Evento corporativo", icon: PartyPopper },
  { id: "CLIENTE_VIP", label: "Presente cliente VIP", icon: Gift },
  { id: "FEIRA", label: "Feira", icon: Rocket },
  { id: "PREMIACAO", label: "Ação promocional / Premiação", icon: Star },
] as const;

const quantities = [50, 100, 250, 500, 1000];
const budgets = [50, 80, 100, 150, 200];

type Step = 1 | 2 | 3 | 4;

const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function KitBuilder() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [objective, setObjective] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [budgetPerPerson, setBudgetPerPerson] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<KitRecommendation | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [consentAceito, setConsentAceito] = useState(false);

  useEffect(() => {
    setCouponCode(getStoredCoupon());
  }, []);

  async function handleGenerate() {
    if (!objective || !quantity || !budgetPerPerson) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kits/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, quantity, budgetPerPerson }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível montar o kit.");
      setRecommendation(data);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitQuote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recommendation || !quantity || !budgetPerPerson) return;
    if (!consentAceito) {
      setSubmitError("É necessário aceitar o Aviso de Privacidade para enviar o orçamento.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      quantidadePessoas: quantity,
      orcamentoPorPessoa: budgetPerPerson,
      objetivo: objective,
      items: recommendation.items.map((item) => ({
        productId: item.product.id,
        quantidade: item.quantityPerPerson * Number(quantity),
        cores: [],
        personalizacao: [],
        metodo: [],
      })),
      clienteNome: String(formData.get("clienteNome") || ""),
      empresa: String(formData.get("empresa") || ""),
      email: String(formData.get("email") || ""),
      telefone: String(formData.get("telefone") || ""),
      cidade: String(formData.get("cidade") || ""),
      observacoes: String(formData.get("observacoes") || ""),
      couponCode: couponCode || undefined,
      consentAceito,
      consentVersion: LEGAL_TERMS_VERSION,
    };

    try {
      const res = await fetch("/api/quotes/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível enviar o orçamento.");
      }
      router.push("/orcamento/sucesso");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={cn(
              "h-1.5 w-16 rounded-full",
              n <= step ? "bg-gradient-brand" : "bg-muted"
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Qual é o objetivo do seu kit?</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {objectives.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setObjective(o.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border p-4 text-left text-sm font-medium transition-colors hover:border-accent",
                  objective === o.id && "border-accent bg-accent/5"
                )}
              >
                <o.icon className="h-5 w-5 text-accent" />
                {o.label}
              </button>
            ))}
          </div>
          <Button className="mt-8" size="lg" variant="gradient" disabled={!objective} onClick={() => setStep(2)}>
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quantas pessoas serão presenteadas?</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {quantities.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={cn(
                  "rounded-md border border-border px-5 py-3 text-sm font-medium hover:border-accent",
                  quantity === q && "border-accent bg-accent/5"
                )}
              >
                {q} pessoas
              </button>
            ))}
          </div>
          <Input
            className="mt-4 max-w-xs"
            type="number"
            placeholder="Outra quantidade"
            min={1}
            value={quantity || ""}
            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
          />
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button size="lg" variant="gradient" disabled={!quantity} onClick={() => setStep(3)}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Qual orçamento por pessoa?</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {budgets.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudgetPerPerson(b)}
                className={cn(
                  "rounded-md border border-border px-5 py-3 text-sm font-medium hover:border-accent",
                  budgetPerPerson === b && "border-accent bg-accent/5"
                )}
              >
                {currency(b)}
              </button>
            ))}
          </div>
          <Input
            className="mt-4 max-w-xs"
            type="number"
            placeholder="Outro valor por pessoa"
            min={1}
            value={budgetPerPerson || ""}
            onChange={(e) => setBudgetPerPerson(e.target.value ? Number(e.target.value) : "")}
          />
          {quantity && budgetPerPerson && (
            <p className="mt-4 text-sm text-muted-foreground">
              Orçamento total estimado:{" "}
              <span className="font-medium text-foreground">{currency(Number(quantity) * Number(budgetPerPerson))}</span>
            </p>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
            <Button size="lg" variant="gradient" disabled={!budgetPerPerson || loading} onClick={handleGenerate}>
              {loading ? "Montando kit..." : "Montar meu kit"}
            </Button>
          </div>
        </div>
      )}

      {step === 4 && recommendation && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Seu kit personalizado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sugestão baseada em {quantity} pessoas e {currency(Number(budgetPerPerson))} por pessoa.
          </p>

          <div className="mt-6 space-y-3">
            {recommendation.items.map((item) => (
              <Card key={item.product.id} className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.product.images[0] ?? "/products/placeholder-1.svg"}
                    alt={item.product.name}
                    fill
                    unoptimized={isExternalImage(item.product.images[0] ?? "")}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(quantity)} unidades · {currency(item.product.price)}/un.
                  </p>
                </div>
                <p className="text-sm font-semibold">{currency(item.product.price * Number(quantity))}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-accent/30 bg-accent/5 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Quantidade</p>
                <p className="font-semibold">{quantity} unidades</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor por pessoa</p>
                <p className="font-semibold">{currency(recommendation.totalPerPerson)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Margem de segurança</p>
                <p className="font-semibold text-success">{currency(recommendation.marginPerPerson)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total geral</p>
                <p className="font-semibold">{currency(recommendation.totalGeral)}</p>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmitQuote} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clienteNome">Nome</Label>
                <Input id="clienteNome" name="clienteNome" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <Input id="empresa" name="empresa" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" required className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" name="cidade" className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="couponCode">Cupom de desconto (opcional)</Label>
                <Input
                  id="couponCode"
                  name="couponCode"
                  className="mt-2"
                  placeholder="Ex: BEMVINDO5"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={consentAceito}
                onCheckedChange={(checked) => setConsentAceito(checked === true)}
                className="mt-0.5"
              />
              <span>
                Autorizo a Paint Colors a utilizar meus dados para contato comercial conforme{" "}
                <Link href="/politica-de-privacidade" className="font-medium text-foreground underline">
                  Aviso de Privacidade
                </Link>
                .
              </span>
            </label>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Ajustar orçamento
              </Button>
              <Button type="submit" size="lg" variant="gradient" disabled={submitting || !consentAceito}>
                {submitting ? "Enviando..." : "Solicitar orçamento deste kit"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
