import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ProductCardData = {
  slug: string;
  name: string;
  images: string[];
  category: { name: string };
  minQty: number;
  premium: boolean;
  sustainable: boolean;
  tags?: string[];
  createdAt?: Date | string;
};

function isNew(createdAt?: Date | string) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 30;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const bestSeller = product.tags?.some((t) => t.toLowerCase() === "mais vendido");
  const novo = isNew(product.createdAt);

  return (
    <Link href={`/produto/${product.slug}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0] ?? "/products/placeholder-1.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {bestSeller && <Badge variant="magenta">Mais vendido</Badge>}
            {!bestSeller && novo && <Badge variant="blue">Novo</Badge>}
            {product.premium && <Badge variant="accent">Premium</Badge>}
            {product.sustainable && <Badge>Sustentável</Badge>}
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
          <h3 className="mt-1 text-base font-medium">{product.name}</h3>
          <p className="mt-2 text-xs text-muted-foreground">Personalização a partir de {product.minQty} unidades</p>
        </div>
      </Card>
    </Link>
  );
}
