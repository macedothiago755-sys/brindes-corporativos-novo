"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCategoryIcon } from "@/components/site/category-icons";
import { cn } from "@/lib/utils";

type CategoryItem = { slug: string; name: string };

const cardClass =
  "group flex shrink-0 snap-start items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:bg-accent/5";

function CategoryCard({ category, className }: { category: CategoryItem; className?: string }) {
  const Icon = getCategoryIcon(category.name);
  return (
    <Link href={`/produtos?categoria=${category.slug}`} className={cn(cardClass, "w-full", className)}>
      <Icon className="h-5 w-5 shrink-0 text-foreground transition-colors group-hover:text-accent" strokeWidth={1.75} />
      <span className="truncate">{category.name}</span>
    </Link>
  );
}

export function CategoriesGrid({ main, rest }: { main: CategoryItem[]; rest: CategoryItem[] }) {
  return (
    <>
      <div
        className={cn(
          "flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory",
          "sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6"
        )}
      >
        {main.map((category) => (
          <div key={category.slug} className="w-[44%] shrink-0 sm:w-full">
            <CategoryCard category={category} />
          </div>
        ))}

        {rest.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(cardClass, "w-[44%] shrink-0 border-dashed border-accent/60 bg-accent/5 sm:w-full")}
              >
                <LayoutGrid className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="truncate">Ver mais categorias</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Todas as categorias</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {rest.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
