import { PrismaClient, CustomizationMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Escritório", slug: "escritorio" },
  { name: "Tecnologia", slug: "tecnologia" },
  { name: "Utilidades", slug: "utilidades" },
  { name: "Eventos", slug: "eventos" },
  { name: "Kits Corporativos", slug: "kits-corporativos" },
  { name: "Sustentáveis", slug: "sustentaveis" },
  { name: "Premium", slug: "premium" },
];

const methodsByPool: CustomizationMethod[][] = [
  ["GRAVACAO_LASER"],
  ["SILK_SCREEN"],
  ["BORDADO"],
  ["IMPRESSAO_UV"],
  ["TRANSFER"],
  ["GRAVACAO_LASER", "IMPRESSAO_UV"],
  ["SILK_SCREEN", "TRANSFER"],
];

const colorPool = [
  ["Preto", "Branco", "Azul Marinho"],
  ["Preto", "Cinza", "Vermelho"],
  ["Branco", "Natural", "Verde"],
  ["Preto", "Dourado", "Prata"],
  ["Azul", "Branco", "Preto", "Vermelho"],
];

const productNames: { name: string; categorySlug: string; premium?: boolean; sustainable?: boolean }[] = [
  { name: "Caderno Executivo Costurado", categorySlug: "escritorio" },
  { name: "Caneta Metálica Premium", categorySlug: "escritorio", premium: true },
  { name: "Conjunto Caneta e Caderno", categorySlug: "kits-corporativos" },
  { name: "Agenda Corporativa Anual", categorySlug: "escritorio" },
  { name: "Porta Cartões em Couro", categorySlug: "escritorio", premium: true },
  { name: "Bloco de Notas Adesivas", categorySlug: "escritorio" },
  { name: "Carregador Portátil 10000mAh", categorySlug: "tecnologia" },
  { name: "Fone de Ouvido Bluetooth", categorySlug: "tecnologia" },
  { name: "Mouse Wireless Corporativo", categorySlug: "tecnologia" },
  { name: "Hub USB-C Multifuncional", categorySlug: "tecnologia" },
  { name: "Caixa de Som Bluetooth", categorySlug: "tecnologia" },
  { name: "Suporte para Celular em Alumínio", categorySlug: "tecnologia" },
  { name: "Garrafa Térmica Inox 500ml", categorySlug: "utilidades" },
  { name: "Squeeze Esportivo", categorySlug: "utilidades" },
  { name: "Kit Churrasco Personalizado", categorySlug: "utilidades" },
  { name: "Guarda-chuva Corporativo", categorySlug: "utilidades" },
  { name: "Necessaire Executiva", categorySlug: "utilidades" },
  { name: "Mochila Notebook Premium", categorySlug: "utilidades", premium: true },
  { name: "Crachá Personalizado com Cordão", categorySlug: "eventos" },
  { name: "Sacola Personalizada para Eventos", categorySlug: "eventos" },
  { name: "Squeeze para Corrida e Eventos", categorySlug: "eventos" },
  { name: "Boné Bordado Institucional", categorySlug: "eventos" },
  { name: "Camiseta Institucional Premium", categorySlug: "eventos" },
  { name: "Kit Boas-Vindas Corporativo", categorySlug: "kits-corporativos" },
  { name: "Kit Home Office Completo", categorySlug: "kits-corporativos" },
  { name: "Kit Café Premium Personalizado", categorySlug: "kits-corporativos", premium: true },
  { name: "Ecobag em Algodão Orgânico", categorySlug: "sustentaveis", sustainable: true },
  { name: "Caderno em Papel Reciclado", categorySlug: "sustentaveis", sustainable: true },
  { name: "Copo Reutilizável em Bambu", categorySlug: "sustentaveis", sustainable: true },
  { name: "Kit Executivo em Couro Legítimo", categorySlug: "premium", premium: true },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.quoteItem.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  for (let i = 0; i < productNames.length; i++) {
    const p = productNames[i];
    const slug = slugify(p.name);
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name} desenvolvido para fortalecer a presença da sua marca em ações corporativas. Produto de alta qualidade, ideal para brindes institucionais e campanhas de relacionamento.`,
        features: [
          "Produção em escala industrial",
          "Personalização sob medida",
          "Controle de qualidade rigoroso",
          "Embalagem para presente disponível",
        ],
        materials: ["Material premium", "Acabamento resistente"],
        colors: colorPool[i % colorPool.length],
        customizationMethods: methodsByPool[i % methodsByPool.length],
        images: [`/products/placeholder-${(i % 6) + 1}.svg`],
        minQty: [50, 100, 250, 500][i % 4],
        leadTimeDays: [10, 15, 20, 25][i % 4],
        dimensions: "Variável conforme modelo",
        printArea: "Área central frontal",
        sustainable: !!p.sustainable,
        premium: !!p.premium,
        featured: i % 5 === 0,
        categoryId: categoryMap.get(p.categorySlug)!,
      },
    });
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@brindescorporativos.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed concluído: categorias, produtos e usuário admin criados.");
  console.log("Login admin: admin@brindescorporativos.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
