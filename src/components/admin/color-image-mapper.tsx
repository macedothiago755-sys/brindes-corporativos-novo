"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ColorImageMapperProps {
  name: string;
  colors: string[];
  defaultValue?: Record<string, string>;
}

/** Permite anexar uma imagem específica para cada cor cadastrada no produto.
 *  Linhas acompanham a lista de cores em tempo real; cores removidas do campo
 *  "Cores" deixam de aparecer aqui (e seu mapeamento é descartado no submit). */
export function ColorImageMapper({ name, colors, defaultValue = {} }: ColorImageMapperProps) {
  const [map, setMap] = useState<Record<string, string>>(defaultValue);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);

  // Apenas cores ainda presentes no campo "Cores" são enviadas no submit —
  // entradas de cores removidas ficam órfãs em `map` mas nunca são serializadas.
  const visibleMap = Object.fromEntries(Object.entries(map).filter(([color]) => colors.includes(color)));

  async function handleUpload(color: string, file: File) {
    setUploadingColor(color);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao enviar imagem");
      }
      const { url } = await res.json();
      setMap((prev) => ({ ...prev, [color]: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploadingColor(null);
    }
  }

  function remove(color: string) {
    setMap((prev) => {
      const next = { ...prev };
      delete next[color];
      return next;
    });
  }

  if (colors.length === 0) {
    return <p className="text-sm text-muted-foreground">Cadastre cores no campo acima para anexar imagens a cada uma.</p>;
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(visibleMap)} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => {
          const url = map[color];
          const uploading = uploadingColor === color;
          return (
            <div key={color} className="flex items-center gap-3 rounded-md border border-border p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {url ? (
                  <Image src={url} alt={color} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{color}</p>
                <label
                  className={cn(
                    "mt-1 inline-block cursor-pointer text-xs text-accent underline-offset-2 hover:underline",
                    uploading && "pointer-events-none opacity-60"
                  )}
                >
                  {uploading ? "Enviando..." : url ? "Trocar imagem" : "Anexar imagem"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(color, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {url && (
                <button
                  type="button"
                  title="Remover imagem"
                  onClick={() => remove(color)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
