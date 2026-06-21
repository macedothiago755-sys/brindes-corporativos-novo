import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { VITRINES } from "@/lib/vitrines";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories, solutions] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.post.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true } }),
    prisma.solution.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  const base = SITE_URL;

  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/produtos`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/brindes-corporativos-sao-paulo`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), priority: 0.8 },
    ...categories.map((c) => ({
      url: `${base}/produtos?categoria=${c.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...solutions.map((s) => ({
      url: `${base}/solucoes/${s.slug}`,
      lastModified: s.updatedAt,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.6,
    })),
    ...VITRINES.map((v) => ({
      url: `${base}/vitrine/${v.slug}`,
      lastModified: new Date(),
      priority: 0.6,
    })),
  ];
}
