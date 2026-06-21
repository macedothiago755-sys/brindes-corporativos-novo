"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DeletionRequestForm() {
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, telefone: telefone || undefined, mensagem: mensagem || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível enviar sua solicitação.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
        Solicitação recebida. Nossa equipe entrará em contato pelo e-mail informado.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="del-email">E-mail</Label>
        <Input id="del-email" type="email" required className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="del-telefone">Telefone (opcional)</Label>
        <Input id="del-telefone" className="mt-2" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="del-mensagem">Mensagem (opcional)</Label>
        <Textarea id="del-mensagem" className="mt-2" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar solicitação"}
      </Button>
    </form>
  );
}
