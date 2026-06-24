import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/cached-queries";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { isExternalImage } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inspirações | Brindes Corporativos",
  description:
    "Conteúdos sobre brindes corporativos personalizados, tendências de marketing promocional e dicas para fortalecer sua marca.",
  alternates: { canonical: "/inspiracoes" },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container-premium py-16">
      <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Inspirações", href: "/inspiracoes" }]} />
      <h1 className="text-3xl font-semibold tracking-tight">Inspirações</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Conteúdos sobre brindes corporativos personalizados, tendências de marketing promocional e dicas para
        fortalecer a presença da sua marca.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/inspiracoes/${post.slug}`}
            className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-accent"
          >
            <div className="relative aspect-[1014/535] overflow-hidden bg-muted">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                unoptimized={isExternalImage(post.coverImage)}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {post.publishedAt.toLocaleDateString("pt-BR")}
              </p>
              <h2 className="mt-2 font-semibold leading-snug">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
