"use client";

import { useEffect, useState } from "react";
import { Gift, Check, Copy } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { setStoredCoupon } from "@/lib/coupon-storage";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

const SHOWN_STORAGE_KEY = "brindes:newsletter-popup-shown";
const SHOW_DELAY_MS = 4000;

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [consentObrigatorio, setConsentObrigatorio] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_STORAGE_KEY)) return;
    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SHOWN_STORAGE_KEY, "1");
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consentObrigatorio) {
      setError("É necessário aceitar o Aviso de Privacidade para continuar.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          empresa,
          email,
          telefone,
          consentObrigatorio,
          consentMarketing,
          consentVersion: LEGAL_TERMS_VERSION,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Não foi possível concluir o cadastro.");

      setCouponCode(data.couponCode);
      setStoredCoupon(data.couponCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        {couponCode ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Gift className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Cupom liberado!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use o código abaixo no seu próximo orçamento e garanta 5% de desconto.
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-5 flex w-full items-center justify-between rounded-md border border-dashed border-accent bg-accent/5 px-4 py-3 text-left"
            >
              <span className="text-lg font-semibold tracking-wide text-accent">{couponCode}</span>
              {copied ? <Check className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5 text-accent" />}
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Sua empresa ganhou um presente 🎁</DialogTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastre seu WhatsApp e e-mail e receba 5% de desconto no primeiro orçamento de brindes
                personalizados.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="popup-nome">Nome</Label>
                <Input
                  id="popup-nome"
                  required
                  className="mt-2"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="popup-empresa">Empresa</Label>
                <Input
                  id="popup-empresa"
                  required
                  className="mt-2"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="popup-email">E-mail</Label>
                <Input
                  id="popup-email"
                  type="email"
                  required
                  className="mt-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="popup-telefone">WhatsApp</Label>
                <Input
                  id="popup-telefone"
                  required
                  className="mt-2"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={consentObrigatorio}
                  onCheckedChange={(checked) => setConsentObrigatorio(checked === true)}
                  className="mt-0.5"
                />
                <span>
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
                  className="mt-0.5"
                />
                <span>
                  Autorizo a Paint Colors a utilizar meus dados para contato comercial conforme o Aviso de
                  Privacidade.
                </span>
              </label>

              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

              <Button type="submit" size="lg" variant="gradient" className="w-full" disabled={loading || !consentObrigatorio}>
                {loading ? "Enviando..." : "Receber meu benefício"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
