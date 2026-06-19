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
};

export function ProductCard({ product }: { product: ProductCardData }) {
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
          <div className="absolute left-3 top-3 flex gap-2">
            {product.premium && <Badge variant="accent">Premium</Badge>}
            {product.sustainable && <Badge>Sustentável</Badge>}
            {product.tags?.slice(0, 1).map((tag) => (
              <Badge key={tag} variant="outline" className="bg-background/80 capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
          <h3 className="mt-1 text-base font-medium">{product.name}</h3>
          <p className="mt-2 text-xs text-muted-foreground">A partir de {product.minQty} unidades</p>
        </div>
      </Card>
    </Link>
  );
}
