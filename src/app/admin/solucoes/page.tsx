import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminSolutionsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "content:edit")) redirect("/admin");

  const solutions = await prisma.solution.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Soluções por objetivo</h1>
        <Button asChild>
          <Link href="/admin/solucoes/novo">
            <Plus className="h-4 w-4" /> Nova solução
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Cada solução tem página própria com produtos relacionados e CTA para orçamento.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {solutions.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{s.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.objective ?? "—"}</td>
                <td className="px-4 py-3">{s._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/solucoes/${s.id}`} className="text-sm text-accent hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {solutions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma solução criada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
