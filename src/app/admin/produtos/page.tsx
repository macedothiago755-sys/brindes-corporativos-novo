import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany(),
  ]);

  async function createProduct(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "");
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.product.create({
      data: {
        name,
        slug,
        description: String(formData.get("description") || ""),
        categoryId: String(formData.get("categoryId") || ""),
        minQty: Number(formData.get("minQty") || 50),
        leadTimeDays: Number(formData.get("leadTimeDays") || 15),
        colors: String(formData.get("colors") || "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        materials: String(formData.get("materials") || "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        features: [],
        images: ["/products/placeholder-1.svg"],
        customizationMethods: [],
      },
    });

    revalidatePath("/admin/produtos");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/produtos");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Qtd. mínima</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/produto/${p.slug}`} target="_blank" className="hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.category.name}</td>
                  <td className="px-4 py-3">{p.minQty}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button variant="outline" size="sm" type="submit">Excluir</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createProduct} className="space-y-4 rounded-xl border border-border p-6">
          <p className="font-semibold">Novo produto</p>
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <select id="categoryId" name="categoryId" required className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="minQty">Qtd. mínima</Label>
              <Input id="minQty" name="minQty" type="number" defaultValue={50} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="leadTimeDays">Prazo (dias)</Label>
              <Input id="leadTimeDays" name="leadTimeDays" type="number" defaultValue={15} className="mt-2" />
            </div>
          </div>
          <div>
            <Label htmlFor="colors">Cores (separadas por vírgula)</Label>
            <Input id="colors" name="colors" placeholder="Preto, Branco, Azul" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="materials">Materiais (separados por vírgula)</Label>
            <Input id="materials" name="materials" placeholder="Aço inox, Plástico ABS" className="mt-2" />
          </div>
          <Button type="submit" className="w-full">Adicionar produto</Button>
        </form>
      </div>
    </div>
  );
}
