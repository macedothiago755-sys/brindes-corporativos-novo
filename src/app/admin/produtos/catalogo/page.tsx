import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/admin/print-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CatalogPdfPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; tag?: string }>;
}) {
  const { categoryId, tag } = await searchParams;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

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

      <h1 className="text-2xl font-semibold">Catálogo comercial</h1>
      <p className="text-sm text-muted-foreground">
        {products.length} produtos · gerado em {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {products.map((p) => {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
            `${baseUrl}/produto/${p.slug}`
          )}`;
          return (
            <div key={p.id} className="break-inside-avoid rounded-lg border border-border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0] ?? "/products/placeholder-1.svg"} alt={p.name} className="aspect-square w-full rounded-md object-cover" />
              <p className="mt-2 text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.shortDescription ?? p.description.slice(0, 80)}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs font-medium">Cód: {p.sku ?? p.id.slice(0, 8)}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Code" className="h-12 w-12" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
