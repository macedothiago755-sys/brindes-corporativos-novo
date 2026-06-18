import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
  const base = "https://www.brindescorporativos.com.br";

  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/produtos`, lastModified: new Date(), priority: 0.9 },
    ...products.map((p) => ({
      url: `${base}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
  ];
}
