import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryRow } from "@/components/admin/category-row";
import { createCategory, updateCategory, deleteCategory, toggleCategoryActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "categories:edit")) redirect("/admin");

  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const byParent = new Map<string | null, typeof categories>();
  for (const category of categories) {
    const key = category.parentId;
    byParent.set(key, [...(byParent.get(key) ?? []), category]);
  }

  const rows: { category: (typeof categories)[number]; depth: number }[] = [];
  function pushChildren(parentId: string | null, depth: number) {
    for (const category of byParent.get(parentId) ?? []) {
      rows.push({ category, depth });
      pushChildren(category.id, depth + 1);
    }
  }
  pushChildren(null, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Produtos</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ category, depth }) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  depth={depth}
                  parentOptions={categories}
                  productCount={category._count.products}
                  updateAction={updateCategory.bind(null, category.id)}
                  deleteAction={deleteCategory}
                  toggleActiveAction={toggleCategoryActive}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">Nova categoria</h2>
          <form action={createCategory} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium" htmlFor="name">Nome</label>
              <Input id="name" name="name" required className="mt-1" placeholder="Ex: Garrafas" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="parentId">Categoria principal (opcional)</label>
              <select
                id="parentId"
                name="parentId"
                defaultValue=""
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">— Categoria principal —</option>
                {categories
                  .filter((c) => c.parentId === null)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <Button type="submit" className="w-full">Criar categoria</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
