import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KitForm } from "@/components/admin/kit-form";
import { Button } from "@/components/ui/button";
import { updateKit, deleteKit } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditKitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [kit, products] = await Promise.all([
    prisma.kit.findUnique({ where: { id }, include: { items: { orderBy: { order: "asc" } } } }),
    prisma.product.findMany({ where: { status: "ATIVO" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!kit) notFound();

  const boundUpdate = updateKit.bind(null, kit.id);

  return (
    <div>
      <Link href="/admin/kits" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para kits
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Editar kit</h1>

      <div className="mt-8 max-w-2xl">
        <KitForm
          action={boundUpdate}
          products={products}
          submitLabel="Salvar alterações"
          initial={{
            name: kit.name,
            description: kit.description,
            image: kit.image,
            objective: kit.objective,
            active: kit.active,
            estimatedPricePerPerson: kit.estimatedPricePerPerson,
            items: kit.items.map((i) => ({ productId: i.productId, quantityPerPerson: i.quantityPerPerson })),
          }}
        />

        <form action={deleteKit} className="mt-6">
          <input type="hidden" name="id" value={kit.id} />
          <Button type="submit" variant="outline" className="text-destructive">
            Excluir kit
          </Button>
        </form>
      </div>
    </div>
  );
}
