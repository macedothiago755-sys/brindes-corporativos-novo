import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView, resolveHeading } from "@/components/site/catalog-view";
import { getCategoryBySlug } from "@/lib/cached-queries";
import { categoryPath } from "@/lib/routes";

type CategorySearchParams = { metodo?: string; tag?: string; objetivo?: string; q?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) return {};
  const title = category.metaTitle?.trim() || resolveHeading(category);
  const description =
    category.metaDescription?.trim() ||
    `${resolveHeading(category)}. Personalize com a marca da sua empresa e receba uma proposta sob medida.`;
  return { title, description, alternates: { canonical: categoryPath(category.slug) } };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CategorySearchParams>;
}) {
  const { slug } = await params;
  const { metodo, tag, objetivo, q } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) notFound();

  return <CatalogView category={category} metodo={metodo} tag={tag} objetivo={objetivo} search={q?.trim()} />;
}
