import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Novo produto</h1>

      <div className="mt-8 max-w-3xl">
        <ProductForm action={createProduct} categories={categories} submitLabel="Criar produto" />
      </div>
    </div>
  );
}
