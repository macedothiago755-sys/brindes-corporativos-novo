/**
 * Auditoria somente-leitura: mostra quais categorias e soluções existem hoje
 * no banco, quais não estão na lista oficial (definida em seed-categories.ts
 * e seed-solutions.ts) e quantos produtos cada uma tem. Não altera nada —
 * use antes de decidir como excluir/reorganizar.
 *
 * Uso: npx tsx scripts/audit-categories.ts
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
    select: { id: true, name: true, slug: true, active: true, parentId: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const naoOficiais = categories.filter((c) => !OFFICIAL_CATEGORY_SLUGS.includes(c.slug));

  console.log(`\n=== CATEGORIAS (${categories.length} no total) ===`);
  for (const c of categories) {
    const flag = OFFICIAL_CATEGORY_SLUGS.includes(c.slug) ? "OFICIAL" : "REMOVER";
    console.log(
      `[${flag}] ${c.active ? "ativa  " : "inativa"} | ${c.name.padEnd(28)} | slug=${c.slug.padEnd(26)} | produtos=${c._count.products}`
    );
  }

  console.log(`\n=== CATEGORIAS FORA DA LISTA OFICIAL: ${naoOficiais.length} ===`);
  const comProdutos = naoOficiais.filter((c) => c._count.products > 0);
  const semProdutos = naoOficiais.filter((c) => c._count.products === 0);
  console.log(`  - Sem produtos (pode excluir direto): ${semProdutos.length}`);
  semProdutos.forEach((c) => console.log(`      ${c.name} (${c.slug})`));
  console.log(`  - COM produtos (precisa decidir o destino antes de excluir): ${comProdutos.length}`);
  comProdutos.forEach((c) => console.log(`      ${c.name} (${c.slug}) — ${c._count.products} produto(s)`));

  const solutions = await prisma.solution.findMany({
    select: { title: true, slug: true, _count: { select: { products: true } } },
    orderBy: { title: "asc" },
  });
  const solucoesNaoOficiais = solutions.filter((s) => !OFFICIAL_SOLUTION_SLUGS.includes(s.slug));

  console.log(`\n=== SOLUÇÕES/VITRINES (${solutions.length} no total) ===`);
  for (const s of solutions) {
    const flag = OFFICIAL_SOLUTION_SLUGS.includes(s.slug) ? "OFICIAL" : "REMOVER";
    console.log(`[${flag}] ${s.title.padEnd(28)} | slug=${s.slug.padEnd(26)} | produtos=${s._count.products}`);
  }
  console.log(`\nSoluções fora da lista oficial: ${solucoesNaoOficiais.length}`);
}

main()
  .catch((err) => {
    console.error("Falha na auditoria:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
