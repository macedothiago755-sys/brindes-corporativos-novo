import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { Palette, Users, Factory, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { QuoteForm } from "@/components/site/quote-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProductGallery } from "@/components/site/product-gallery";
import { SITE_URL } from "@/lib/site-config";

const b2bHighlights = [
  { icon: Palette, label: "Personalização com sua marca" },
  { icon: Users, label: "Ideal para eventos corporativos" },
  { icon: Factory, label: "Produção em alta escala" },
];

const methodLabels: Record<string, string> = {
  GRAVACAO_LASER: "Gravação a laser",
  SILK_SCREEN: "Silk screen",
  BORDADO: "Bordado",
  IMPRESSAO_UV: "Impressão UV",
  TRANSFER: "Transfer",
};

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: { category: true } });
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const title = product.metaTitle ?? `${product.name} | Brindes personalizados para empresas`;
  const description = product.metaDescription ?? product.shortDescription ?? product.description;
  return {
    title,
    description,
    openGraph: { title, description, images: product.images },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status !== "ATIVO") notFound();

  // Registra a visualização após a resposta, sem bloquear a renderização.
  after(() => {
    prisma.productView.create({ data: { productId: product.id } }).catch(() => {});
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    category: product.category.name,
    url: `${SITE_URL}/produto/${product.slug}`,
    brand: { "@type": "Brand", name: product.brand ?? "Paint Colors" },
    ...(product.sku ? { sku: product.sku } : {}),
  };

  return (
    <div className="container-premium py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs
        items={[
          { name: "Início", href: "/" },
          { name: "Produtos", href: "/produtos" },
          { name: product.category.name, href: `/produtos?categoria=${product.category.slug}` },
          { name: product.name, href: `/produto/${product.slug}` },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.premium && <Badge variant="accent">Premium</Badge>}
            {product.sustainable && <Badge>Sustentável</Badge>}
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          {product.benefits.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
            {b2bHighlights.map((h) => (
              <li key={h.label} className="flex items-center gap-2">
                <h.icon className="h-4 w-4 text-accent" />
                {h.label}
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Quantidade mínima</dt>
              <dd className="font-medium">{product.minQty} unidades</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Prazo estimado</dt>
              <dd className="font-medium">{product.leadTimeDays} dias úteis</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dimensões</dt>
              <dd className="font-medium">{product.dimensions}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Área de personalização</dt>
              <dd className="font-medium">{product.printArea}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Materiais</dt>
              <dd className="font-medium">{product.materials.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cores disponíveis</dt>
              <dd className="font-medium">{product.colors.join(", ")}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground">Tipos de personalização</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.customizationMethods.map((m) => (
                <Badge key={m} variant="outline">
                  {methodLabels[m]}
                </Badge>
              ))}
            </div>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {product.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>

          <div className="mt-10">
            <QuoteForm productId={product.id} productName={product.name} colors={product.colors} />
          </div>
        </div>
      </div>
    </div>
  );
}
