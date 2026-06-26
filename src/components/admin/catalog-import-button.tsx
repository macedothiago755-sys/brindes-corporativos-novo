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

  // Limite de corpo de requisição da Vercel para funções serverless (~4,5 MB).
  // Acima disso a plataforma rejeita antes de chegar na rota, devolvendo uma
  // resposta que não é JSON. Barramos no cliente com uma mensagem clara.
  const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

  async function handleFile(file: File) {
    setResult(null);
    setError(null);

    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setError(
        `Arquivo muito grande (${mb} MB). O limite é 4 MB. Dica: salve a planilha sem imagens embutidas ou divida em lotes menores.`
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/produtos/import", { method: "POST", body: formData });

      // A resposta pode não ser JSON (ex.: 413/504 da plataforma devolvem HTML).
      // Lemos como texto e tentamos parsear para não quebrar no res.json().
      const text = await res.text();
      let json: Partial<ImportResult> & { error?: string } = {};
      let parsed = true;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        parsed = false;
      }

      if (!parsed) {
        // Resposta não-JSON: traduz o status HTTP para uma mensagem útil.
        if (res.status === 413) {
          setError("Arquivo muito grande para o servidor (limite ~4,5 MB). Divida em lotes menores.");
        } else if (res.status === 504) {
          setError("O servidor demorou demais para processar (timeout). Tente uma planilha menor.");
        } else {
          setError(`Falha ao importar (HTTP ${res.status}). Tente novamente em instantes.`);
        }
        return;
      }

      if (!res.ok) {
        setError(json.error ?? `Falha ao importar a planilha (HTTP ${res.status}).`);
      } else {
        setResult(json as ImportResult);
        router.refresh();
      }
    } catch {
      setError("Não foi possível enviar a planilha. Verifique sua conexão e tente novamente.");
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
        <Upload className="h-4 w-4" /> {uploading ? "Importando..." : "Importar planilha (CSV/Excel)"}
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
