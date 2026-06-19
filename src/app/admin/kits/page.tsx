import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminKitsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "kits:edit")) redirect("/admin");

  const kits = await prisma.kit.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true, quotes: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kits personalizados</h1>
        <Button asChild>
          <Link href="/admin/kits/novo">
            <Plus className="h-4 w-4" /> Novo kit
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Crie kits manuais ou ajuste sugestões geradas automaticamente pelo montador de kits do site.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3">Orçamentos gerados</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {kits.map((kit) => (
              <tr key={kit.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{kit.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{kit.objective ?? "—"}</td>
                <td className="px-4 py-3">{kit._count.items}</td>
                <td className="px-4 py-3">{kit._count.quotes}</td>
                <td className="px-4 py-3">
                  <Badge variant={kit.active ? "success" : "outline"}>{kit.active ? "Ativo" : "Inativo"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/kits/${kit.id}`} className="text-sm text-accent hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {kits.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum kit criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
