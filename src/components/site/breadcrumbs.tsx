import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site-config";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * Renderiza a trilha de navegação visível e o structured data
 * BreadcrumbList (schema.org) usado por Google e respostas de IA.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <nav aria-label="Trilha de navegação" className="mb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {isLast ? (
                <span className="text-foreground" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-foreground">
                  {item.name}
                </Link>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
