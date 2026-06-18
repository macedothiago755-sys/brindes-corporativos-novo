import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { attributes: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{product.name}</h1>

      <div className="mt-8 max-w-3xl">
        <ProductForm
          action={updateProduct.bind(null, id)}
          categories={categories}
          submitLabel="Salvar alterações"
          defaultValues={{
            name: product.name,
            sku: product.sku,
            supplierCode: product.supplierCode,
            brand: product.brand,
            status: product.status,
            categoryId: product.categoryId,
            description: product.description,
            shortDescription: product.shortDescription,
            benefits: product.benefits,
            features: product.features,
            materials: product.materials,
            colors: product.colors,
            price: product.price,
            promoPrice: product.promoPrice,
            saleUnit: product.saleUnit,
            minQty: product.minQty,
            leadTimeDays: product.leadTimeDays,
            shippingDays: product.shippingDays,
            dimensions: product.dimensions,
            printArea: product.printArea,
            metaTitle: product.metaTitle,
            metaDescription: product.metaDescription,
            images: product.images,
            attributes: product.attributes.map((a) => ({ name: a.name, value: a.value })),
          }}
        />
      </div>
    </div>
  );
}
