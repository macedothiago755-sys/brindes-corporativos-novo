"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImportResult = { updated: number; skipped: number; errors: string[] };

export function CatalogImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/produtos/import", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Falha ao importar a planilha.");
      } else {
        setResult(json as ImportResult);
        router.refresh();
      }
    } catch {
      setError("Erro de rede ao enviar a planilha.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> {uploading ? "Importando..." : "Importar planilha"}
      </Button>

      {(result || error) && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-md border border-border bg-background p-4 text-sm shadow-lg">
          {error && <p className="text-destructive">{error}</p>}
          {result && (
            <div className="space-y-2">
              <p className="font-medium">
                {result.updated} atualizado(s), {result.skipped} ignorado(s).
              </p>
              {result.errors.length > 0 && (
                <ul className="max-h-40 list-disc space-y-1 overflow-y-auto pl-4 text-xs text-muted-foreground">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button
            type="button"
            className="mt-3 text-xs text-accent underline"
            onClick={() => {
              setResult(null);
              setError(null);
            }}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
