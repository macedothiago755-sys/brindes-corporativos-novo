/**
 * Exclui definitivamente as categorias que NÃO estão na lista oficial
 * (a mesma lista usada em seed-categories.ts). Só apaga categorias com
 * zero produtos vinculados — se alguma tiver produto, ela é pulada e
 * reportada, em vez de falhar a operação toda.
 *
 * Rode scripts/audit-categories.ts antes para confirmar o impacto.
 * Depois desta limpeza, rode `npm run db:categories` e `npm run db:solutions`
 * para garantir que as 23 categorias e 6 soluções oficiais existam completas.
 *
 * Uso: npx tsx scripts/cleanup-categories.ts
 */
import { prisma } from "@/lib/prisma";

const OFFICIAL_CATEGORY_SLUGS = [
  "blocos-e-cadernetas",
  "bolsas-termicas",
  "canecas",
  "canetas",
  "chaveiros",
  "conjuntos-executivos",
  "cozinha",
  "cuidados-pessoais",
  "escritorio",
  "esportes",
  "ferramentas",
  "guarda-chuva",
  "informatica",
  "kit-churrasco",
  "kit-queijo",
  "linha-ecologica",
  "linha-feminina",
  "linha-masculina",
  "linha-pet",
  "mochilas-e-bolsas",
  "necessaires",
  "sacolas-e-sacochilas",
  "squeezes-e-garrafas",
];

const OFFICIAL_SOLUTION_SLUGS = [
  "brindes-para-rh",
  "brindes-para-clientes",
  "eventos-corporativos",
  "kits-corporativos",
  "sustentaveis",
  "premium",
];

async function main() {
  const categories = await prisma.category.findMany({
    where: { slug: { notIn: OFFICIAL_CATEGORY_SLUGS } },
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
  });

  const podeExcluir = categories.filter((c) => c._count.products === 0);
  const temProdutos = categories.filter((c) => c._count.products > 0);

  console.log(`\nCategorias fora da lista oficial: ${categories.length}`);
  console.log(`  - Serão excluídas (0 produtos): ${podeExcluir.length}`);
  console.log(`  - PULADAS (têm produtos, exclua manualmente após decidir o destino): ${temProdutos.length}`);
  temProdutos.forEach((c) => console.log(`      ${c.name} (${c.slug}) — ${c._count.products} produto(s)`));

  if (podeExcluir.length > 0) {
    const result = await prisma.category.deleteMany({
      where: { id: { in: podeExcluir.map((c) => c.id) } },
    });
    console.log(`\n${result.count} categoria(s) excluída(s).`);
  }

  const solutions = await prisma.solution.findMany({
    where: { slug: { notIn: OFFICIAL_SOLUTION_SLUGS } },
    select: { id: true, title: true, slug: true, _count: { select: { products: true } } },
  });

  if (solutions.length > 0) {
    console.log(`\nSoluções fora da lista oficial: ${solutions.length}`);
    solutions.forEach((s) => console.log(`      ${s.title} (${s.slug}) — ${s._count.products} produto(s)`));
    const result = await prisma.solution.deleteMany({
      where: { id: { in: solutions.map((s) => s.id) } },
    });
    console.log(`${result.count} solução(ões) excluída(s).`);
  } else {
    console.log("\nNenhuma solução fora da lista oficial.");
  }

  console.log("\nLimpeza concluída. Rode `npm run db:categories` e `npm run db:solutions` para garantir que as 23 categorias e 6 soluções oficiais existam completas.");
}

main()
  .catch((err) => {
    console.error("Falha na limpeza:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
