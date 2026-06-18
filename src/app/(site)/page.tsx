import { prisma } from "@/lib/prisma";
import { BannerCarousel } from "@/components/site/banner-carousel";
import { PromoGridSection } from "@/components/site/promo-grid";
import { ProductCard } from "@/components/site/product-card";
import {
  CategoriesSection,
  DifferentiatorsSection,
  HowItWorksSection,
  ClientsSection,
  TestimonialsSection,
  FinalCtaSection,
} from "@/components/site/sections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    include: { category: true },
    take: 8,
  });

  return (
    <>
      <BannerCarousel />
      <CategoriesSection />
      <PromoGridSection />

      <section className="container-premium py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produtos em destaque</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <DifferentiatorsSection />
      <HowItWorksSection />
      <ClientsSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}
