import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SolutionForm } from "@/components/admin/solution-form";
import { Button } from "@/components/ui/button";
import { updateSolution, deleteSolution } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [solution, products] = await Promise.all([
    prisma.solution.findUnique({ where: { id }, include: { products: true } }),
    prisma.product.findMany({ where: { status: "ATIVO" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!solution) notFound();

  const boundUpdate = updateSolution.bind(null, solution.id);

  return (
    <div>
      <Link href="/admin/solucoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para soluções
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Editar solução</h1>

      <div className="mt-8 max-w-2xl">
        <SolutionForm
          action={boundUpdate}
          products={products}
          submitLabel="Salvar alterações"
          initial={{
            title: solution.title,
            description: solution.description,
            image: solution.image,
            ctaLabel: solution.ctaLabel,
            objective: solution.objective,
            productIds: solution.products.map((p) => p.productId),
          }}
        />

        <form action={deleteSolution} className="mt-6">
          <input type="hidden" name="id" value={solution.id} />
          <Button type="submit" variant="outline" className="text-destructive">
            Excluir solução
          </Button>
        </form>
      </div>
    </div>
  );
}
