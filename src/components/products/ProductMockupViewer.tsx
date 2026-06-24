"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloud, Wand2, RotateCcw, Check, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn, isExternalImage } from "@/lib/utils";
import { setStoredMockup } from "@/lib/mockup-storage";
import { trackEvent } from "@/lib/analytics";
import { CUSTOMIZATION_METHOD_LABELS, MONOCHROME_CUSTOMIZATION_METHODS } from "@/lib/customization-methods";

const methodLabels: Record<string, string> = CUSTOMIZATION_METHOD_LABELS;

// Métodos que simulam gravação monocromática (sem cor da arte original).
const MONOCHROME_METHODS: ReadonlySet<string> = MONOCHROME_CUSTOMIZATION_METHODS;

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/svg+xml": [".svg"],
} as const;

const MAX_LOGO_SIZE = 10 * 1024 * 1024; // 10MB, alinhado ao /api/upload
const CANVAS_MAX = 1200; // limita o lado maior do canvas (performance)

interface MockupParams {
  scale: number; // 0.1 – 2
  x: number; // deslocamento horizontal em % do canvas (-50 a 50)
  y: number; // deslocamento vertical em % do canvas (-50 a 50)
  opacity: number; // 0 – 100
  method: string;
}

const DEFAULT_PARAMS: Omit<MockupParams, "method"> = { scale: 1, x: 0, y: 0, opacity: 100 };

interface ProductMockupViewerProps {
  productId: string;
  productImage: string;
  productName: string;
  methods: string[];
}

export function ProductMockupViewer({ productId, productImage, productName, methods }: ProductMockupViewerProps) {
  const prefersReducedMotion = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoReady, setLogoReady] = useState(false);

  const availableMethods = methods.length > 0 ? methods : ["GRAVACAO_LASER"];
  const [params, setParams] = useState<MockupParams>({ ...DEFAULT_PARAMS, method: availableMethods[0] });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Carregamento da imagem de fundo (produto) -------------------------
  // crossOrigin="anonymous" permite exportar o canvas quando o CDN do produto
  // enviar cabeçalhos CORS. Quando não enviar, o canvas fica "tainted" e o
  // salvamento cai no fallback (envia o logo original + parâmetros).
  useEffect(() => {
    let cancelled = false;

    // CDNs sem cabeçalho Access-Control-Allow-Origin rejeitam a requisição por
    // completo quando crossOrigin="anonymous" é definido (não apenas "tainted").
    // Tenta com CORS primeiro (necessário para exportar o composite); se falhar,
    // recarrega sem CORS para ao menos exibir a imagem (exporta via fallback).
    function load(withCors: boolean) {
      const img = new Image();
      if (withCors && isExternalImage(productImage)) img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.fetchPriority = "high";
      img.onload = () => {
        if (cancelled) return;
        bgImgRef.current = img;
        setBgLoaded(true);
      };
      img.onerror = () => {
        if (cancelled) return;
        if (withCors) load(false);
        else setBgError(true);
      };
      img.src = productImage;
    }

    load(true);
    return () => {
      cancelled = true;
    };
  }, [productImage]);

  // ---- Carregamento do logo ----------------------------------------------
  useEffect(() => {
    if (!logoUrl) {
      logoImgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      logoImgRef.current = img;
      setLogoReady(true);
    };
    img.onerror = () => setError("Não foi possível ler o logotipo enviado.");
    img.src = logoUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [logoUrl]);

  // Libera o objectURL anterior ao trocar/desmontar.
  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  // ---- Desenho do canvas --------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const bg = bgImgRef.current;
    if (!canvas || !bg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensiona o canvas à imagem do produto (limitando o lado maior).
    const ratio = Math.min(CANVAS_MAX / bg.naturalWidth, CANVAS_MAX / bg.naturalHeight, 1);
    const w = Math.round(bg.naturalWidth * ratio) || CANVAS_MAX;
    const h = Math.round(bg.naturalHeight * ratio) || CANVAS_MAX;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.drawImage(bg, 0, 0, w, h);

    const logo = logoImgRef.current;
    if (!logo) return;

    const logoNaturalW = logo.naturalWidth || 300;
    const logoNaturalH = logo.naturalHeight || 300;
    const aspect = logoNaturalH / logoNaturalW;

    // Base: 35% da largura do canvas, ajustada pela escala do usuário.
    const drawW = w * 0.35 * params.scale;
    const drawH = drawW * aspect;
    const cx = w / 2 + (params.x / 100) * w;
    const cy = h / 2 + (params.y / 100) * h;

    const isMono = MONOCHROME_METHODS.has(params.method);
    // Laser: simula gravação monocromática e levemente translúcida.
    ctx.filter = isMono ? "grayscale(1) contrast(1.15) brightness(0.92)" : "none";
    ctx.globalAlpha = (params.opacity / 100) * (isMono ? 0.85 : 1);
    ctx.drawImage(logo, cx - drawW / 2, cy - drawH / 2, drawW, drawH);

    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }, [params]);

  // Redesenha quando o fundo/logo carregam ou os parâmetros mudam.
  useEffect(() => {
    if (bgLoaded) draw();
  }, [bgLoaded, logoReady, draw]);

  // ---- Upload do logo (dropzone) -----------------------------------------
  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      if (file.size > MAX_LOGO_SIZE) {
        setError("O logotipo excede o tamanho máximo de 10MB.");
        return;
      }
      setError(null);
      setSaved(false);
      setLogoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setLogoFile(file);
      trackEvent("mockup_logo_uploaded", { product_id: productId });
    },
    [productId]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const code = rejections[0]?.errors[0]?.code;
    setError(
      code === "file-invalid-type"
        ? "Formato inválido. Envie um arquivo PNG, JPG ou SVG."
        : "Não foi possível usar este arquivo. Tente outro."
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPT,
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  function resetParams() {
    setParams((p) => ({ ...DEFAULT_PARAMS, method: p.method }));
    setSaved(false);
  }

  // ---- Salvar personalização ---------------------------------------------
  async function handleSave() {
    if (!logoFile) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const paramHint = `s${params.scale.toFixed(2)}-x${params.x}-y${params.y}-o${params.opacity}-${params.method}`;

    try {
      const upload = new FormData();
      const canvas = canvasRef.current;

      // 1) Tenta exportar o canvas compositado (produto + logo aplicado).
      let composite: Blob | null = null;
      if (canvas) {
        try {
          composite = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/png")
          );
        } catch {
          // Canvas "tainted" (imagem do produto sem CORS): segue para o fallback.
          composite = null;
        }
      }

      let filename: string;
      if (composite) {
        filename = `mockup-${paramHint}.png`;
        upload.append("file", new File([composite], filename, { type: "image/png" }));
      } else {
        // 2) Fallback: envia o logo original; os parâmetros vão no nome do
        // arquivo para o time comercial reproduzir a aplicação manualmente.
        const ext = logoFile.name.split(".").pop() ?? "png";
        filename = `logo-${paramHint}.${ext}`;
        upload.append("file", new File([logoFile], filename, { type: logoFile.type }));
      }

      const res = await fetch("/api/upload", { method: "POST", body: upload });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Falha ao salvar a personalização.");
      }
      const { url } = (await res.json()) as { url: string };

      setStoredMockup({
        productId,
        url,
        filename,
        params: { ...params },
      });
      setSaved(true);
      trackEvent("mockup_saved", { product_id: productId, method: params.method, composite: Boolean(composite) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const controlsTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" as const };

  return (
    <section aria-labelledby="mockup-title" className="mt-12 rounded-2xl border border-border bg-card p-5 sm:p-8">
      <div className="flex items-start gap-3">
        <Wand2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <h2 id="mockup-title" className="text-xl font-semibold tracking-tight">
            Simule sua marca neste brinde
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Envie seu logotipo e veja, em tempo real, como ele fica aplicado em <strong>{productName}</strong>.
            Ajuste tamanho, posição e opacidade e salve para anexar ao seu orçamento.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Preview */}
        <div
          {...getRootProps()}
          className={cn(
            "relative aspect-square overflow-hidden rounded-xl border bg-muted transition-colors",
            isDragActive ? "border-accent ring-2 ring-accent/40" : "border-border"
          )}
        >
          <input {...getInputProps()} aria-label="Enviar logotipo" />

          {bgError ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" />
              <p className="text-sm">Não foi possível carregar a imagem do produto.</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Pré-visualização de ${productName} com o logotipo aplicado`}
              className="h-full w-full object-contain"
            />
          )}

          {/* Overlay de instrução enquanto não há logo */}
          {!logoUrl && !bgError && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/55 text-center backdrop-blur-[1px]">
              <UploadCloud className="h-9 w-9 text-accent" />
              <p className="px-6 text-sm font-medium text-foreground">
                {isDragActive ? "Solte o logotipo aqui" : "Arraste seu logotipo aqui"}
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou SVG · até 10MB</p>
              <Button type="button" size="sm" variant="outline" onClick={open} className="pointer-events-auto mt-1">
                Escolher arquivo
              </Button>
            </div>
          )}
        </div>

        {/* Controles */}
        <motion.div
          initial={false}
          animate={{ opacity: logoUrl ? 1 : 0.55 }}
          transition={controlsTransition}
          className="space-y-5"
          aria-hidden={!logoUrl}
        >
          <fieldset disabled={!logoUrl} className="space-y-5 disabled:opacity-60">
            <div>
              <Label htmlFor="mockup-method">Método de personalização</Label>
              <select
                id="mockup-method"
                value={params.method}
                onChange={(e) => {
                  setParams((p) => ({ ...p, method: e.target.value }));
                  setSaved(false);
                }}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                {availableMethods.map((m) => (
                  <option key={m} value={m}>
                    {methodLabels[m] ?? m}
                  </option>
                ))}
              </select>
              {MONOCHROME_METHODS.has(params.method) && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Simulação monocromática — laser não reproduz as cores da arte.
                </p>
              )}
            </div>

            <SliderControl
              label="Tamanho"
              value={params.scale}
              min={0.1}
              max={2}
              step={0.05}
              display={`${Math.round(params.scale * 100)}%`}
              onChange={(v) => {
                setParams((p) => ({ ...p, scale: v }));
                setSaved(false);
              }}
            />
            <SliderControl
              label="Posição horizontal"
              value={params.x}
              min={-50}
              max={50}
              step={1}
              display={`${params.x}`}
              onChange={(v) => {
                setParams((p) => ({ ...p, x: v }));
                setSaved(false);
              }}
            />
            <SliderControl
              label="Posição vertical"
              value={params.y}
              min={-50}
              max={50}
              step={1}
              display={`${params.y}`}
              onChange={(v) => {
                setParams((p) => ({ ...p, y: v }));
                setSaved(false);
              }}
            />
            <SliderControl
              label="Opacidade"
              value={params.opacity}
              min={10}
              max={100}
              step={1}
              display={`${params.opacity}%`}
              onChange={(v) => {
                setParams((p) => ({ ...p, opacity: v }));
                setSaved(false);
              }}
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button type="button" onClick={handleSave} disabled={saving || !logoFile}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
                  </>
                ) : saved ? (
                  <>
                    <Check className="h-4 w-4" /> Personalização salva
                  </>
                ) : (
                  "Salvar personalização"
                )}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={resetParams}>
                <RotateCcw className="h-4 w-4" /> Redefinir
              </Button>
            </div>

            {saved && (
              <p className="text-sm text-accent" role="status">
                Pronto! Sua personalização será anexada automaticamente ao solicitar o orçamento deste produto.
              </p>
            )}
          </fieldset>
        </motion.div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{display}</span>
      </div>
      <Slider
        className="mt-2"
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
