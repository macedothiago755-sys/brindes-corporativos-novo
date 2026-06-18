"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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

export function QuoteForm({ productId, productName, colors }: { productId: string; productName: string; colors: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantidade, setQuantidade] = useState("100");
  const [customQty, setCustomQty] = useState("");
  const [cor, setCor] = useState(colors[0] ?? "");
  const [personalizacao, setPersonalizacao] = useState<string[]>([]);
  const [metodo, setMetodo] = useState<string[]>([]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Quantidade desejada</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {quantities.map((q) => (
                <button
                  type="button"
                  key={q}
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
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
              />
            )}
          </div>

          {colors.length > 0 && (
            <div>
              <Label>Cor</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c}
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

          <div>
            <Label>Personalização</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {personalizationOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={personalizacao.includes(opt.id)}
                    onCheckedChange={() => toggle(personalizacao, setPersonalizacao, opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Método de personalização</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {methodOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
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
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Solicitar orçamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
