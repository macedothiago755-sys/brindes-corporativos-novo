"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LeadRowActions({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir definitivamente os dados deste lead? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Dados excluídos com sucesso.");
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir os dados.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnonymize() {
    if (!confirm("Anonimizar os dados deste lead? Nome, e-mail e telefone serão substituídos permanentemente.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/anonymize`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success("Dados anonimizados com sucesso.");
      router.refresh();
    } catch {
      toast.error("Não foi possível anonimizar os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={loading} onClick={handleAnonymize}>
        Anonimizar
      </Button>
      <Button variant="outline" size="sm" disabled={loading} onClick={handleDelete}>
        Excluir dados
      </Button>
    </div>
  );
}
