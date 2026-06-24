/**
 * Seed idempotente das soluções oficiais.
 *
 * SEGURO PARA PRODUÇÃO — NÃO apaga nada: faz upsert por slug das 6 soluções
 * oficiais. Soluções existentes que não estão nesta lista são preservadas
 * (o modelo Solution não tem flag de "ativo"); exclua manualmente pelo
 * admin (/admin/solucoes) se quiser remover alguma.
 *
 * Rodar com:  npm run db:solutions
 */
import { PrismaClient, ProductObjective } from "@prisma/client";

const prisma = new PrismaClient();

type OfficialSolution = {
  title: string;
  slug: string;
  description: string;
  image: string;
  objective?: ProductObjective;
  order: number;
};

const officialSolutions: OfficialSolution[] = [
  {
    title: "Brindes para RH",
    slug: "brindes-para-rh",
    description: "Kits de boas-vindas, onboarding e ações de endomarketing para colaboradores.",
    image: "/solucoes/brindes-para-rh.png",
    objective: ProductObjective.ONBOARDING,
    order: 1,
  },
  {
    title: "Brindes para clientes",
    slug: "brindes-para-clientes",
    description: "Brindes para fortalecer o relacionamento e fidelizar clientes da sua empresa.",
    image: "/solucoes/brindes-para-clientes.png",
    objective: ProductObjective.CLIENTE_VIP,
    order: 2,
  },
  {
    title: "Eventos corporativos",
    slug: "eventos-corporativos",
    description: "Brindes personalizados para feiras, congressos e eventos da sua empresa.",
    image: "/solucoes/eventos-corporativos.png",
    objective: ProductObjective.EVENTO,
    order: 3,
  },
  {
    title: "Kits corporativos",
    slug: "kits-corporativos",
    description: "Kits completos e personalizáveis para presentear equipes e parceiros.",
    image: "/solucoes/kits-corporativos.png",
    order: 4,
  },
  {
    title: "Sustentáveis",
    slug: "sustentaveis",
    description: "Brindes ecológicos e sustentáveis para empresas com compromisso ambiental.",
    image: "/solucoes/sustentaveis.png",
    order: 5,
  },
  {
    title: "Premium",
    slug: "premium",
    description: "Brindes corporativos premium para ocasiões e públicos especiais.",
    image: "/solucoes/premium.png",
    objective: ProductObjective.PREMIACAO,
    order: 6,
  },
];

async function main() {
  for (const s of officialSolutions) {
    await prisma.solution.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        description: s.description,
        image: s.image,
        objective: s.objective ?? null,
        order: s.order,
      },
      create: {
        title: s.title,
        slug: s.slug,
        description: s.description,
        image: s.image,
        objective: s.objective ?? null,
        order: s.order,
      },
    });
  }

  console.log(`✓ ${officialSolutions.length} soluções oficiais criadas/atualizadas.`);
  console.log("Nenhuma solução foi excluída.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
