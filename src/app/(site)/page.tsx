import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/site/hero";
import { TrustStats } from "@/components/site/trust-stats";
import { BannerCarousel } from "@/components/site/banner-carousel";
import { FeaturedProductsCarousel } from "@/components/site/featured-products-carousel";
import {
  CategoriesSection,
  SolutionsSection,
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
    take: 12,
  });

  return (
    <>
      <CategoriesSection />
      <BannerCarousel />
      <TrustStats />
      <Hero />
      <SolutionsSection />

      <section className="container-premium py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produtos em destaque</h2>
        <div className="mt-10">
          <FeaturedProductsCarousel products={featured} />
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
