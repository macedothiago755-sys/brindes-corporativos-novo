import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SolutionForm } from "@/components/admin/solution-form";
import { createSolution } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewSolutionPage() {
  const products = await prisma.product.findMany({
    where: { status: "ATIVO" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link href="/admin/solucoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para soluções
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Nova solução</h1>

      <div className="mt-8 max-w-2xl">
        <SolutionForm action={createSolution} products={products} submitLabel="Criar solução" />
      </div>
    </div>
  );
}
