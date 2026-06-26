import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { CatalogView, resolveHeading } from "@/components/site/catalog-view";
import { categoryPath } from "@/lib/routes";

type ProductsSearchParams = { categoria?: string; metodo?: string; tag?: string; objetivo?: string; q?: string };

// Preserva os demais filtros ao redirecionar a URL antiga de categoria para a nova.
function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}): Promise<Metadata> {
  const { categoria, objetivo } = await searchParams;
  // URL de categoria migrou para /categoria/[slug]; aponta o canonical para lá.
  if (categoria) return { alternates: { canonical: categoryPath(categoria) } };
  const title = resolveHeading(null, objetivo);
  const description = `${title}. Personalize com a marca da sua empresa e receba uma proposta sob medida.`;
  return { title, description, alternates: { canonical: "/produtos" } };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const { categoria, metodo, tag, objetivo, q } = await searchParams;

  // URLs antigas /produtos?categoria=X consolidam (308) na rota canônica limpa,
  // preservando os demais filtros aplicados.
  if (categoria) {
    permanentRedirect(`${categoryPath(categoria)}${buildQuery({ metodo, tag, objetivo, q })}`);
  }

  return <CatalogView category={null} metodo={metodo} tag={tag} objetivo={objetivo} search={q?.trim()} />;
}
