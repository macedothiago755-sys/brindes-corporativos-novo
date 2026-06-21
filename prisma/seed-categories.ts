/**
 * Seed idempotente das categorias oficiais (FASE 10).
 *
 * SEGURO PARA PRODUÇÃO — NÃO apaga nada:
 *  1. Cria/atualiza (upsert por slug) as 23 categorias oficiais como ativas,
 *     ordenadas e com SEO preenchido.
 *  2. Marca como INATIVAS (active = false) todas as categorias que não estão
 *     na lista oficial — elas somem do site público, mas continuam no admin,
 *     com seus produtos intactos, para você reorganizar e excluir depois.
 *
 * Rodar com:  npm run db:categories
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type OfficialCategory = {
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
};

const officialCategories: OfficialCategory[] = [
  { name: "Blocos e Cadernetas", slug: "blocos-e-cadernetas", metaTitle: "Blocos e cadernetas personalizados para empresas | Paint Colors", metaDescription: "Blocos e cadernetas personalizados com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Bolsas Térmicas", slug: "bolsas-termicas", metaTitle: "Bolsas térmicas personalizadas para empresas | Paint Colors", metaDescription: "Bolsas térmicas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Canecas", slug: "canecas", metaTitle: "Canecas personalizadas para empresas | Paint Colors", metaDescription: "Canecas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Canetas", slug: "canetas", metaTitle: "Canetas personalizadas para empresas | Paint Colors", metaDescription: "Canetas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Chaveiros", slug: "chaveiros", metaTitle: "Chaveiros personalizados para empresas | Paint Colors", metaDescription: "Chaveiros personalizados com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Conjuntos Executivos", slug: "conjuntos-executivos", metaTitle: "Conjuntos executivos personalizados para empresas | Paint Colors", metaDescription: "Conjuntos executivos personalizados com a marca da sua empresa. Brindes corporativos premium, com produção e entrega para todo o Brasil." },
  { name: "Cozinha", slug: "cozinha", metaTitle: "Brindes de cozinha personalizados para empresas | Paint Colors", metaDescription: "Brindes de cozinha personalizados com a marca da sua empresa. Produtos corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Cuidados Pessoais", slug: "cuidados-pessoais", metaTitle: "Brindes de cuidados pessoais para empresas | Paint Colors", metaDescription: "Brindes de cuidados pessoais personalizados com a marca da sua empresa. Produtos corporativos sob medida, com entrega para todo o Brasil." },
  { name: "Escritório", slug: "escritorio", metaTitle: "Brindes de escritório personalizados para empresas | Paint Colors", metaDescription: "Brindes de escritório personalizados com a marca da sua empresa. Produtos corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Esportes", slug: "esportes", metaTitle: "Brindes esportivos personalizados para empresas | Paint Colors", metaDescription: "Brindes esportivos personalizados com a marca da sua empresa. Produtos corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Ferramentas", slug: "ferramentas", metaTitle: "Ferramentas personalizadas para empresas | Paint Colors", metaDescription: "Ferramentas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Guarda-Chuva", slug: "guarda-chuva", metaTitle: "Guarda-chuvas personalizados para empresas | Paint Colors", metaDescription: "Guarda-chuvas personalizados com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Informática", slug: "informatica", metaTitle: "Brindes de informática personalizados para empresas | Paint Colors", metaDescription: "Brindes de informática e tecnologia personalizados com a marca da sua empresa. Produtos corporativos sob medida, com entrega para todo o Brasil." },
  { name: "Kit Churrasco", slug: "kit-churrasco", metaTitle: "Kits de churrasco personalizados para empresas | Paint Colors", metaDescription: "Kits de churrasco personalizados com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Kit Queijo", slug: "kit-queijo", metaTitle: "Kits de queijo personalizados para empresas | Paint Colors", metaDescription: "Kits de queijo personalizados com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Linha Ecológica", slug: "linha-ecologica", metaTitle: "Brindes ecológicos personalizados para empresas | Paint Colors", metaDescription: "Brindes ecológicos e sustentáveis personalizados com a marca da sua empresa. Produtos corporativos sob medida, com entrega para todo o Brasil." },
  { name: "Linha Feminina", slug: "linha-feminina", metaTitle: "Linha feminina de brindes personalizados para empresas | Paint Colors", metaDescription: "Brindes da linha feminina personalizados com a marca da sua empresa. Produtos corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Linha Masculina", slug: "linha-masculina", metaTitle: "Linha masculina de brindes personalizados para empresas | Paint Colors", metaDescription: "Brindes da linha masculina personalizados com a marca da sua empresa. Produtos corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Linha Pet", slug: "linha-pet", metaTitle: "Brindes pet personalizados para empresas | Paint Colors", metaDescription: "Brindes pet personalizados com a marca da sua empresa. Produtos corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Mochilas e Bolsas", slug: "mochilas-e-bolsas", metaTitle: "Mochilas e bolsas personalizadas para empresas | Paint Colors", metaDescription: "Mochilas e bolsas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Nécessaires", slug: "necessaires", metaTitle: "Nécessaires personalizadas para empresas | Paint Colors", metaDescription: "Nécessaires personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
  { name: "Sacolas e Sacochilas", slug: "sacolas-e-sacochilas", metaTitle: "Ecobags e sacolas personalizadas para empresas | Paint Colors", metaDescription: "Ecobags, sacolas e sacochilas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com entrega para todo o Brasil." },
  { name: "Squeezes e Garrafas", slug: "squeezes-e-garrafas", metaTitle: "Squeezes e garrafas personalizadas para empresas | Paint Colors", metaDescription: "Squeezes e garrafas personalizadas com a marca da sua empresa. Brindes corporativos sob medida, com produção e entrega para todo o Brasil." },
];

async function main() {
  // 1) Upsert das categorias oficiais (ativas, ordenadas, com SEO). Nunca apaga.
  for (let i = 0; i < officialCategories.length; i++) {
    const c = officialCategories[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        active: true,
        order: i + 1,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
      },
      create: {
        name: c.name,
        slug: c.slug,
        active: true,
        order: i + 1,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
      },
    });
  }

  // 2) Oculta (active = false) todas as categorias que NÃO são oficiais.
  //    Nada é apagado: produtos continuam vinculados e disponíveis.
  const officialSlugs = officialCategories.map((c) => c.slug);
  const hidden = await prisma.category.updateMany({
    where: { slug: { notIn: officialSlugs } },
    data: { active: false },
  });

  console.log(`✓ ${officialCategories.length} categorias oficiais criadas/atualizadas e ativas.`);
  console.log(`✓ ${hidden.count} categoria(s) antiga(s) marcada(s) como inativa(s) — ocultas do site, preservadas no admin.`);
  console.log("Nenhum produto ou categoria foi excluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
