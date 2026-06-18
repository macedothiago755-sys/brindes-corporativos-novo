"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  name: string;
  defaultValue?: string[];
}

/** Primeira imagem da lista é sempre a principal. */
export function ImageUploader({ name, defaultValue = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        const uploaded: string[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Falha ao enviar imagem");
          }
          const { url } = await res.json();
          uploaded.push(url);
        }
        setImages((prev) => [...prev, ...uploaded]);
        toast.success(`${uploaded.length} imagem(ns) enviada(s)`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [], "image/svg+xml": [] },
    multiple: true,
  });

  function remove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function setPrimary(index: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  function move(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {images.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition-colors",
          isDragActive && "border-accent bg-muted"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-5 w-5" />
        <p>{uploading ? "Enviando..." : "Arraste imagens aqui ou clique para selecionar"}</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <div key={url} className="group relative overflow-hidden rounded-md border border-border">
              <div className="relative aspect-square bg-muted">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
              </div>
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                  Principal
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title="Definir como principal"
                  onClick={() => setPrimary(index)}
                  className="rounded bg-white/90 p-1.5 hover:bg-white"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Mover para esquerda"
                  onClick={() => move(index, -1)}
                  className="rounded bg-white/90 p-1.5 hover:bg-white"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Remover"
                  onClick={() => remove(index)}
                  className="rounded bg-white/90 p-1.5 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
