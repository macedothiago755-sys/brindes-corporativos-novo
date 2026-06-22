"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCategoryIcon } from "@/components/site/category-icons";
import { categoryPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

type CategoryItem = { slug: string; name: string };

const cardClass =
  "group flex shrink-0 snap-start items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:bg-accent/5";

function CategoryCard({ category, className }: { category: CategoryItem; className?: string }) {
  const Icon = getCategoryIcon(category.name);
  return (
    <Link href={categoryPath(category.slug)} className={cn(cardClass, "w-full", className)}>
      <Icon className="h-5 w-5 shrink-0 text-foreground transition-colors group-hover:text-accent" strokeWidth={1.75} />
      <span className="truncate">{category.name}</span>
    </Link>
  );
}

function AllCategoriesDialog({ categories, trigger }: { categories: CategoryItem[]; trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Todas as categorias</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesGrid({
  main,
  rest,
  featured,
  all,
}: {
  main: CategoryItem[];
  rest: CategoryItem[];
  featured: CategoryItem[];
  all: CategoryItem[];
}) {
  return (
    <>
      <div className="sm:hidden">
        <p className="text-sm font-semibold text-foreground/80">Explore por categoria</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {featured.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={category.slug}
                href={categoryPath(category.slug)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-4 text-center text-xs font-medium transition-colors hover:border-accent hover:bg-accent/5"
              >
                <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                <span className="truncate">{category.name}</span>
              </Link>
            );
          })}
        </div>
        {all.length > 0 && (
          <AllCategoriesDialog
            categories={all}
            trigger={
              <button
                type="button"
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/60 bg-accent/5 py-3 text-sm font-medium text-accent"
              >
                <LayoutGrid className="h-4 w-4" />
                Ver todas categorias
              </button>
            }
          />
        )}
      </div>

      <div className="hidden gap-2.5 sm:grid sm:grid-cols-3 lg:grid-cols-6">
        {main.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}

        {rest.length > 0 && (
          <AllCategoriesDialog
            categories={rest}
            trigger={
              <button type="button" className={cn(cardClass, "w-full border-dashed border-accent/60 bg-accent/5")}>
                <LayoutGrid className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="truncate">Ver mais categorias</span>
              </button>
            }
          />
        )}
      </div>
    </>
  );
}
