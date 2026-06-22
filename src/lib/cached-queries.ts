import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const CACHE_TAGS = {
  products: "products",
  posts: "posts",
  solutions: "solutions",
  categories: "categories",
} as const;

export const getFeaturedProducts = unstable_cache(
  async () => {
    const featured = await prisma.product.findMany({
      where: { featured: true, status: "ATIVO" },
      include: { category: true },
      take: 12,
    });
    if (featured.length > 0) return featured;
    // Fallback: nenhum produto marcado como destaque — mostra os ativos mais
    // recentes para a seção da home nunca ficar vazia.
    return prisma.product.findMany({
      where: { status: "ATIVO" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  },
  ["home-featured-products"],
  { revalidate: 300, tags: [CACHE_TAGS.products] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.product.findUnique({ where: { slug }, include: { category: true } });
  },
  ["product-by-slug"],
  { revalidate: 300, tags: [CACHE_TAGS.products] }
);

export const getRelatedProducts = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    return prisma.product.findMany({
      where: { status: "ATIVO", categoryId, id: { not: excludeId } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  },
  ["related-products"],
  { revalidate: 300, tags: [CACHE_TAGS.products] }
);

export const getVitrineProducts = unstable_cache(
  async (tag: string | undefined, take: number | undefined) => {
    return prisma.product.findMany({
      where: { status: "ATIVO", ...(tag ? { tags: { has: tag } } : {}) },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take,
    });
  },
  ["vitrine-products"],
  { revalidate: 300, tags: [CACHE_TAGS.products] }
);

export const getBlogPosts = unstable_cache(
  async () => prisma.post.findMany({ orderBy: { publishedAt: "desc" } }),
  ["blog-posts"],
  { revalidate: 300, tags: [CACHE_TAGS.posts] }
);

export const getBlogPostBySlug = unstable_cache(
  async (slug: string) => prisma.post.findUnique({ where: { slug } }),
  ["blog-post-by-slug"],
  { revalidate: 300, tags: [CACHE_TAGS.posts] }
);

export const getActiveCategories = unstable_cache(
  async () => prisma.category.findMany({ where: { parentId: null, active: true }, orderBy: { order: "asc" } }),
  ["active-categories"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export const getActiveCategoriesTree = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { parentId: null, active: true },
      include: { children: { where: { active: true }, orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
  ["active-categories-tree"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) =>
    prisma.category.findUnique({ where: { slug }, include: { children: true } }),
  ["category-by-slug"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export const getSolutionsList = unstable_cache(
  async () => prisma.solution.findMany({ orderBy: { order: "asc" } }),
  ["solutions-list"],
  { revalidate: 300, tags: [CACHE_TAGS.solutions] }
);

export const getSolutionBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.solution.findUnique({
      where: { slug },
      include: {
        products: { include: { product: { include: { category: true } } } },
        kits: { where: { active: true }, include: { items: { include: { product: true } } } },
      },
    });
  },
  ["solution-by-slug"],
  { revalidate: 300, tags: [CACHE_TAGS.solutions] }
);
