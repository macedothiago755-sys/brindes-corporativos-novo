"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "CONCLUIDO", label: "Concluído" },
] as const;

export function DeletionRequestActions({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/privacy-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status atualizado.");
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
