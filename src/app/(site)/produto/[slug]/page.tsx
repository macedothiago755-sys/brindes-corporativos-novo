import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import { Palette, Users, Factory, Check, Clock, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, getRelatedProducts } from "@/lib/cached-queries";
import { Badge } from "@/components/ui/badge";
import { AddToQuoteCart } from "@/components/site/add-to-quote-cart";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductMockupViewer } from "@/components/products/ProductMockupViewer";
import { ProductCard } from "@/components/site/product-card";
import { TrackView } from "@/components/site/track-view";
import { WhatsappCta } from "@/components/site/whatsapp-cta";
import { SITE_URL } from "@/lib/site-config";
import { categoryPath } from "@/lib/routes";
import { CUSTOMIZATION_METHOD_LABELS } from "@/lib/customization-methods";

const b2bHighlights = [
  { icon: Palette, label: "Personalização com sua marca" },
  { icon: Users, label: "Ideal para eventos corporativos" },
  { icon: Factory, label: "Produção em alta escala" },
];

const methodLabels: Record<string, string> = CUSTOMIZATION_METHOD_LABELS;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ATIVO") notFound();

  // Registra a visualização após a resposta, sem bloquear a renderização.
  after(() => {
    prisma.productView.create({ data: { productId: product.id } }).catch(() => {});
  });

  const related = await getRelatedProducts(product.categoryId, product.id);

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
    <>
    <div className="container-premium py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView
        event="view_product"
        params={{ product_id: product.id, product_name: product.name, category: product.category.name }}
      />

      <Breadcrumbs
        items={[
          { name: "Início", href: "/" },
          { name: "Produtos", href: "/produtos" },
          { name: product.category.name, href: categoryPath(product.category.slug) },
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

          <div className="mt-10 space-y-4">
            <AddToQuoteCart
              productId={product.id}
              slug={product.slug}
              name={product.name}
              image={product.images[0] ?? "/products/placeholder-1.svg"}
              unitPrice={product.price}
              priceTier={product.priceTier}
              colors={product.colors}
            />
            <WhatsappCta
              source="produto"
              productName={product.name}
              message={`Olá! Tenho interesse no brinde "${product.name}". Podem me ajudar com um orçamento?\n${SITE_URL}/produto/${product.slug}`}
            />
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Proposta em até 1 hora útil
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Seus dados protegidos —{" "}
              <Link href="/politica-de-privacidade" className="underline hover:text-foreground">
                política de privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <ProductMockupViewer
        productId={product.id}
        productImage={product.images[0] ?? "/products/placeholder-1.svg"}
        productName={product.name}
        methods={product.customizationMethods}
      />
    </div>

    {related.length > 0 && (
      <section className="border-t border-border bg-muted py-16">
        <div className="container-premium">
          <h2 className="text-2xl font-semibold tracking-tight">
            Produtos relacionados em {product.category.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Outros brindes da mesma categoria que combinam com o seu projeto.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </div>
      </section>
    )}
    </>
  );
}
