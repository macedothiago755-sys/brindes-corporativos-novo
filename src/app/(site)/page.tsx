import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/site/hero";
import { TrustStats } from "@/components/site/trust-stats";
import { FeaturedProductsCarousel } from "@/components/site/featured-products-carousel";
import { FaqSection } from "@/components/site/faq-section";
import { brindesSaoPauloFaq } from "@/lib/faq-data";
import {
  CategoriesSection,
  SolutionsSection,
  DifferentiatorsSection,
  HowItWorksSection,
  LocalSeoSection,
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
      <Hero />
      <TrustStats />
      <CategoriesSection />
      <HowItWorksSection />

      <section className="container-premium py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produtos em destaque</h2>
        <div className="mt-10">
          <FeaturedProductsCarousel products={featured} />
        </div>
      </section>

      <SolutionsSection />
      <DifferentiatorsSection />
      <ClientsSection />
      <TestimonialsSection />
      <LocalSeoSection />
      <FaqSection items={brindesSaoPauloFaq} />
      <FinalCtaSection />
    </>
  );
}
