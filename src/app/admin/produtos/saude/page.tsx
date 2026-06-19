import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMissingDescriptions } from "../actions";

export const dynamic = "force-dynamic";

export default async function CatalogHealthPage() {
  const [total, semImagem, semDescricao, semSku, poucasInfo, duplicados] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { images: { isEmpty: true } } }),
    prisma.product.count({ where: { shortDescription: null } }),
    prisma.product.count({ where: { sku: null } }),
    prisma.product.count({ where: { benefits: { isEmpty: true }, features: { isEmpty: true } } }),
    prisma.product.groupBy({
      by: ["name"],
      _count: true,
      having: { name: { _count: { gt: 1 } } },
    }),
  ]);

  const duplicateCount = duplicados.reduce((sum, d) => sum + d._count, 0);
  const issues = semImagem + semDescricao + semSku + poucasInfo + duplicateCount;

  const cards = [
    { label: "Produtos sem imagem", count: semImagem, issue: "sem-imagem" },
    { label: "Produtos sem descrição curta", count: semDescricao, issue: "sem-descricao" },
    { label: "Produtos sem SKU", count: semSku, issue: "sem-sku" },
    { label: "Produtos com poucas informações", count: poucasInfo, issue: "poucas-informacoes" },
  ];

  return (
    <div>
      <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para produtos
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Saúde do catálogo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Seu catálogo tem {total} {total === 1 ? "produto" : "produtos"}, {issues} {issues === 1 ? "precisa" : "precisam"} de
        melhorias.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.issue} href={`/admin/produtos?issue=${c.issue}`}>
            <Card className="transition hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{c.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos duplicados (mesmo nome)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{duplicateCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={generateMissingDescriptions}>
            <Button type="submit" variant="outline">
              <Sparkles className="h-4 w-4" /> Gerar descrição automática (até 20 produtos sem descrição)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
