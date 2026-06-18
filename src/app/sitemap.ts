import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.post.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  const base = "https://www.brindescorporativos.com.br";

  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/produtos`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), priority: 0.8 },
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
  ];
}
