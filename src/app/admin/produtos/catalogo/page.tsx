import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/admin/print-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER, CONTACT_EMAIL, SITE_URL } from "@/lib/site-config";
import { CUSTOMIZATION_METHOD_LABELS, type CustomizationMethodValue } from "@/lib/customization-methods";

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

  const contactDomain = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="relative">
      {/* Marca d'água: logo repetido no fundo a 4% de opacidade, impede reuso/plágio
          dos cards. Visível na impressão e oculto a cliques. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-repeat opacity-[0.04]"
        style={{ backgroundImage: "url(/logo-paint-colors.png)", backgroundSize: "240px" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl p-8">
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

        {/* Header institucional: logo à esquerda, contatos à direita. */}
        <header className="flex items-end justify-between gap-4 border-b border-slate-300 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-paint-colors.png" alt="Paint Colors" className="h-12 w-auto" />
          <div className="text-right text-[11px] leading-relaxed text-slate-500">
            <p className="font-semibold tracking-wide text-slate-700">{CONTACT_EMAIL}</p>
            <p>{contactDomain}</p>
          </div>
        </header>
        <p className="mt-2 text-[11px] text-slate-400">
          {products.length} produtos · gerado em {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {products.map((p) => {
            // Código real do produto: SKU → Código do fornecedor → ID curto.
            const codigo = p.sku || p.supplierCode || p.id.slice(0, 8).toUpperCase();
            const mensagem = `Olá! Gostaria de um orçamento para o produto de Código: ${codigo}`;
            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(
              waUrl
            )}`;
            const materiais = p.materials.slice(0, 3).join(" / ");
            // Tipo de gravação: métodos cadastrados ou fallback institucional padrão.
            const personalizacao =
              p.customizationMethods.length > 0
                ? p.customizationMethods
                    .map((m) => CUSTOMIZATION_METHOD_LABELS[m as CustomizationMethodValue] ?? m)
                    .slice(0, 3)
                    .join(" / ")
                : "Laser / Silk";

            return (
              <div
                key={p.id}
                className="flex break-inside-avoid flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images[0] ?? "/products/placeholder-1.svg"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">{p.category.name}</p>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-slate-900">{p.name}</h3>

                  {/* Especificações técnicas no lugar do bloco de descrição longo. */}
                  <dl className="mt-2.5 space-y-1 text-[10px] leading-snug text-slate-600">
                    {p.dimensions && (
                      <div className="flex gap-1.5">
                        <dt className="font-semibold text-slate-400">Dimensões</dt>
                        <dd>{p.dimensions}</dd>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <dt className="font-semibold text-slate-400">Personalização</dt>
                      <dd>{personalizacao}</dd>
                    </div>
                    {materiais && (
                      <div className="flex gap-1.5">
                        <dt className="font-semibold text-slate-400">Material</dt>
                        <dd>{materiais}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Rodapé travado na base: código + QR alinhados em toda a linha. */}
                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-200 pt-3">
                    <div>
                      <p className="text-[11px] font-bold tracking-tight text-slate-900">Cód: {codigo}</p>
                      <p className="mt-1 max-w-[92px] text-[8px] font-semibold uppercase leading-tight tracking-[0.08em] text-slate-700">
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
    </div>
  );
}
