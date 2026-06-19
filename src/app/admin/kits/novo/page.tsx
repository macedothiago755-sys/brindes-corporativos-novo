import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KitForm } from "@/components/admin/kit-form";
import { createKit } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewKitPage() {
  const products = await prisma.product.findMany({
    where: { status: "ATIVO" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link href="/admin/kits" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para kits
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Novo kit</h1>

      <div className="mt-8 max-w-2xl">
        <KitForm action={createKit} products={products} submitLabel="Criar kit" />
      </div>
    </div>
  );
}
