import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/admin/print-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/site-config";
import { OBJECTIVE_LABELS } from "@/lib/catalog-spreadsheet";

export const dynamic = "force-dynamic";

export default async function CatalogPdfPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; tag?: string }>;
}) {
  const { categoryId, tag } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ATIVO",
        ...(categoryId ? { categoryId } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <form className="mb-8 flex flex-wrap items-end gap-3 print:hidden">
        <div>
          <label className="text-sm font-medium">Categoria</label>
          <select name="categoryId" defaultValue={categoryId ?? ""} className="mt-2 h-11 rounded-md border border-border bg-background px-4 text-sm">
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Tag</label>
          <Input name="tag" defaultValue={tag ?? ""} placeholder="ex: premium" className="mt-2" />
        </div>
        <Button type="submit" variant="outline">Filtrar</Button>
        <div className="ml-auto">
          <PrintButton />
        </div>
      </form>

      <div className="border-b-2 border-foreground pb-4">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Catálogo Comercial</h1>
        <p className="mt-1 text-sm font-medium uppercase tracking-widest text-accent">
          Brindes corporativos personalizados
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {products.length} produtos · gerado em {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
        {products.map((p) => {
          // Código real do produto: SKU → Código do fornecedor → ID curto.
          const codigo = p.sku || p.supplierCode || p.id.slice(0, 8).toUpperCase();
          const mensagem = `Olá! Gostaria de um orçamento para o produto de Código: ${codigo}`;
          const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(
            waUrl
          )}`;
          const materiais = p.materials.slice(0, 3).join(" / ");
          const objetivos = p.objectives.map((o) => OBJECTIVE_LABELS[o] ?? o).slice(0, 2).join(" / ");

          return (
            <div
              key={p.id}
              className="flex break-inside-avoid flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0] ?? "/products/placeholder-1.svg"}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">{p.category.name}</p>
                <h3 className="mt-1 text-sm font-bold leading-snug text-foreground">{p.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {p.shortDescription ?? p.description.slice(0, 90)}
                </p>

                {materiais && (
                  <p className="mt-2 text-[10px] text-foreground/80">
                    <span className="font-semibold">Material:</span> {materiais}
                  </p>
                )}

                {objetivos && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.objectives.map((o) => OBJECTIVE_LABELS[o] ?? o).slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-foreground/70"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rodapé ancorado na base para alinhar código + QR em todos os cards. */}
                <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] font-bold tracking-tight text-foreground">Cód: {codigo}</p>
                    <p className="mt-1 max-w-[90px] text-[8px] font-medium uppercase leading-tight tracking-wide text-accent">
                      Escaneie para solicitar orçamento
                    </p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt={`QR Code para orçamento do código ${codigo}`} className="h-14 w-14 shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
