import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.publishedAt.toISOString(),
  };

  return (
    <article className="container-premium py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="text-sm text-accent underline">
        ← Voltar para o blog
      </Link>

      <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">
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
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
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
    </article>
  );
}
