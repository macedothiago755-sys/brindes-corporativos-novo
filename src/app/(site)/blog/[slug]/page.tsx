import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/cached-queries";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  // "Continue lendo": prioriza posts que compartilham tags com o atual e
  // completa com os mais recentes. Evita o beco sem saída no fim do artigo,
  // distribui link equity interno e segura o leitor no site.
  const allPosts = await getBlogPosts();
  const others = allPosts.filter((p) => p.slug !== post.slug);
  const related = [...others]
    .sort(
      (a, b) =>
        b.tags.filter((t) => post.tags.includes(t)).length -
        a.tags.filter((t) => post.tags.includes(t)).length
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-paint-colors.png` },
    },
  };

  return (
    <article className="container-premium py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs
        items={[
          { name: "Início", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {post.publishedAt.toLocaleDateString("pt-BR")}
      </p>
      <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="relative mt-8 aspect-[1920/600] w-full overflow-hidden rounded-xl bg-muted">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" preload />
      </div>

      <div className="prose prose-neutral mt-10 max-w-2xl text-base leading-relaxed text-foreground/90">
        {post.content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="mb-6">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-muted p-8 text-center">
        <p className="font-semibold">Quer um brinde personalizado para sua empresa?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Navegue pelo catálogo e solicite um orçamento sob medida para o seu projeto.
        </p>
        <Link href="/produtos" className="mt-4 inline-block text-sm font-medium text-accent underline">
          Ver catálogo de produtos
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Continue lendo</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-accent"
              >
                <div className="relative aspect-[1014/535] overflow-hidden bg-muted">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.publishedAt.toLocaleDateString("pt-BR")}
                  </p>
                  <h3 className="mt-2 font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
