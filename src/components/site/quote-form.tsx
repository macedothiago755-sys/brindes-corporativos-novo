"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getStoredCoupon } from "@/lib/coupon-storage";
import { trackEvent } from "@/lib/analytics";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

const quantities = ["50", "100", "250", "500", "1000+"];
const personalizationOptions = [
  { id: "logo", label: "Logo" },
  { id: "nome", label: "Nome" },
  { id: "frase", label: "Frase" },
  { id: "arte", label: "Arte personalizada" },
];
const methodOptions = [
  { id: "GRAVACAO_LASER", label: "Laser" },
  { id: "IMPRESSAO_UV", label: "Impressão" },
  { id: "BORDADO", label: "Bordado" },
  { id: "OUTRO", label: "Outro" },
];

export function QuoteForm({ productId, productName, colors, unitPrice }: { productId: string; productName: string; colors: string[]; unitPrice?: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantidade, setQuantidade] = useState("100");
  const [customQty, setCustomQty] = useState("");
  const [cor, setCor] = useState(colors[0] ?? "");
  const [personalizacao, setPersonalizacao] = useState<string[]>([]);
  const [metodo, setMetodo] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [consentObrigatorio, setConsentObrigatorio] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  useEffect(() => {
    setCouponCode(getStoredCoupon());
  }, []);

  useEffect(() => {
    if (!open) setStep(1);
    else trackEvent("start_quote", { product_name: productName });
  }, [open, productName]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function goToStep2() {
    // Personalização e método são opcionais: não bloqueiam o avanço para o
    // contato (reduz fricção no funil). O time comercial confirma os detalhes
    // depois, a partir dos dados do lead.
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consentObrigatorio) {
      setError("É necessário aceitar o Aviso de Privacidade e os Termos de Uso para enviar o orçamento.");
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("arquivo") as File | null;
    let attachmentUrl: string | null = null;

    try {
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          attachmentUrl = uploadJson.url;
        }
      }
    } catch {
      // upload é opcional; seguimos com o orçamento mesmo se falhar
    }

    const payload = {
      productId,
      attachmentUrl,
      quantidade: quantidade === "1000+" ? Number(customQty || 1000) : Number(quantidade),
      cores: [cor],
      personalizacao,
      metodo,
      clienteNome: String(formData.get("clienteNome") || ""),
      empresa: String(formData.get("empresa") || ""),
      email: String(formData.get("email") || ""),
      telefone: String(formData.get("telefone") || ""),
      cidade: String(formData.get("cidade") || ""),
      observacoes: String(formData.get("observacoes") || ""),
      couponCode: couponCode || undefined,
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
        product_name: productName,
        quantity: payload.quantidade,
        lead_source: "produto",
        // Valor estimado do lead (somente quando o produto tem preço cadastrado).
        ...(unitPrice ? { value: Number((unitPrice * payload.quantidade).toFixed(2)), currency: "BRL" } : {}),
      });
      setOpen(false);
      router.push("/orcamento/sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Montar orçamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar orçamento</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">{productName}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className={cn("h-1.5 flex-1 rounded-full bg-muted", step >= 1 && "bg-accent")} />
            <div className={cn("h-1.5 flex-1 rounded-full bg-muted", step >= 2 && "bg-accent")} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Etapa {step} de 2 · {step === 1 ? "Personalização do brinde" : "Seus dados de contato"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={cn("space-y-6", step !== 1 && "hidden")}>
          <div role="group" aria-labelledby="qtd-label">
            <Label id="qtd-label">Quantidade desejada</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {quantities.map((q) => (
                <button
                  type="button"
                  key={q}
                  aria-pressed={quantidade === q}
                  onClick={() => setQuantidade(q)}
                  className={cn(
                    "rounded-md border border-border px-4 py-2 text-sm",
                    quantidade === q && "border-accent bg-accent text-accent-foreground"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
            {quantidade === "1000+" && (
              <Input
                className="mt-3"
                placeholder="Informe a quantidade aproximada"
                aria-label="Quantidade aproximada"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
              />
            )}
          </div>

          {colors.length > 0 && (
            <div role="group" aria-labelledby="cor-label">
              <Label id="cor-label">Cor</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-pressed={cor === c}
                    onClick={() => setCor(c)}
                    className={cn(
                      "rounded-md border border-border px-4 py-2 text-sm",
                      cor === c && "border-accent bg-accent text-accent-foreground"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div role="group" aria-labelledby="pers-label">
            <Label id="pers-label">Personalização</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {personalizationOptions.map((opt) => (
                <label key={opt.id} htmlFor={`pers-${opt.id}`} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id={`pers-${opt.id}`}
                    checked={personalizacao.includes(opt.id)}
                    onCheckedChange={() => toggle(personalizacao, setPersonalizacao, opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div role="group" aria-labelledby="metodo-label">
            <Label id="metodo-label">Método de personalização</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {methodOptions.map((opt) => (
                <label key={opt.id} htmlFor={`met-${opt.id}`} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id={`met-${opt.id}`}
                    checked={metodo.includes(opt.id)}
                    onCheckedChange={() => toggle(metodo, setMetodo, opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="arquivo">Enviar logo/arte (opcional)</Label>
            <Input id="arquivo" name="arquivo" type="file" className="mt-2" accept="image/*,.pdf,.ai,.eps" />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <Button type="button" size="lg" className="w-full" onClick={goToStep2}>
            Continuar
          </Button>
          </div>

          <div className={cn("space-y-6", step !== 2 && "hidden")}>
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
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" className="mt-2" />
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
              checked={consentObrigatorio}
              onCheckedChange={(checked) => setConsentObrigatorio(checked === true)}
              aria-labelledby="consent-obrigatorio-label"
              aria-required="true"
              className="mt-0.5"
            />
            <span id="consent-obrigatorio-label">
              Li e aceito o{" "}
              <Link href="/politica-de-privacidade" className="font-medium text-foreground underline">
                Aviso de Privacidade
              </Link>{" "}
              e os{" "}
              <Link href="/termos-de-uso" className="font-medium text-foreground underline">
                Termos de Uso
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={consentMarketing}
              onCheckedChange={(checked) => setConsentMarketing(checked === true)}
              aria-labelledby="consent-marketing-label"
              className="mt-0.5"
            />
            <span id="consent-marketing-label">
              Autorizo a Paint Colors a utilizar meus dados para contato comercial conforme o Aviso de
              Privacidade.
            </span>
          </label>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={loading || !consentObrigatorio}>
              {loading ? "Enviando..." : "Solicitar orçamento"}
            </Button>
          </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
