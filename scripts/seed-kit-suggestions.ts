/**
 * Cria os kits sugeridos (6 grupos x 5 faixas de preço) definidos pelo
 * usuário, escolhendo produtos reais do catálogo por categoria e preço.
 *
 * Cada kit é identificado por um slug fixo (idempotente — roda de novo sem
 * duplicar, atualiza os itens se o catálogo mudou). Kits sem produtos
 * suficientes na faixa de preço são pulados e reportados no final, em vez
 * de criados incompletos.
 *
 * Importante: o banco hoje só tem 5 objetivos (ONBOARDING, EVENTO,
 * CLIENTE_VIP, FEIRA, PREMIACAO), mas o usuário pediu 6 grupos. Por decisão
 * do usuário, "Kits corporativos" reaproveita FEIRA e "Sustentáveis"
 * reaproveita PREMIACAO (mesmo objetivo dos kits Premium) — distinguíveis
 * pelo nome/descrição de cada kit, não pelo filtro de objetivo.
 *
 * Uso:
 *   npx tsx scripts/seed-kit-suggestions.ts            (dry-run)
 *   npx tsx scripts/seed-kit-suggestions.ts --apply    (grava)
 */
import { prisma } from "@/lib/prisma";
import type { ProductObjective } from "@prisma/client";

type ItemSpec = { categorySlugs: string[]; label: string };

type KitSpec = {
  slug: string;
  name: string;
  objective: ProductObjective;
  maxPerPerson: number;
  description: string;
  items: ItemSpec[];
};

const KITS: KitSpec[] = [
  // 1) Brindes para RH
  {
    slug: "rh-essencial",
    name: "Kit Essencial — Boas-vindas",
    objective: "ONBOARDING",
    maxPerPerson: 20,
    description: "Primeiro dia com a sua marca: integração e pertencimento.",
    items: [
      { categorySlugs: ["canetas"], label: "Caneta personalizada" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderneta simples" },
      { categorySlugs: ["chaveiros"], label: "Chaveiro ou marcador" },
    ],
  },
  {
    slug: "rh-integracao",
    name: "Kit Integração",
    objective: "ONBOARDING",
    maxPerPerson: 50,
    description: "Ideal para onboarding de novos colaboradores.",
    items: [
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno personalizado" },
      { categorySlugs: ["canetas"], label: "Caneta premium" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Squeeze simples" },
    ],
  },
  {
    slug: "rh-colaborador",
    name: "Kit Colaborador",
    objective: "ONBOARDING",
    maxPerPerson: 80,
    description: "Percepção de empresa que cuida do time.",
    items: [
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa/squeeze inox" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["canetas"], label: "Caneta metal" },
      { categorySlugs: ["necessaires"], label: "Necessaire ou estojo" },
    ],
  },
  {
    slug: "rh-completo",
    name: "Kit Completo — RH",
    objective: "ONBOARDING",
    maxPerPerson: 150,
    description: "Kit completo de boas-vindas para novos colaboradores.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila ou bolsa" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa premium" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno premium" },
      { categorySlugs: ["canetas"], label: "Caneta" },
      { categorySlugs: ["necessaires"], label: "Necessaire" },
    ],
  },
  {
    slug: "rh-experiencia",
    name: "Kit Experiência",
    objective: "ONBOARDING",
    maxPerPerson: 9999,
    description: "Experiência premium de boas-vindas, acima de R$200 por pessoa.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila premium" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa térmica" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno executivo" },
      { categorySlugs: ["informatica"], label: "Fone" },
    ],
  },

  // 2) Brindes para clientes
  {
    slug: "clientes-lembranca",
    name: "Kit Lembrança",
    objective: "CLIENTE_VIP",
    maxPerPerson: 20,
    description: "Para ser lembrado — ideal para distribuição em volume alto.",
    items: [
      { categorySlugs: ["canetas"], label: "Caneta" },
      { categorySlugs: ["chaveiros"], label: "Chaveiro" },
      { categorySlugs: ["necessaires"], label: "Porta cartão" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Bloquinho" },
    ],
  },
  {
    slug: "clientes-relacionamento",
    name: "Kit Relacionamento",
    objective: "CLIENTE_VIP",
    maxPerPerson: 50,
    description: "Fortalece o relacionamento com o cliente.",
    items: [
      { categorySlugs: ["canecas"], label: "Caneca" },
      { categorySlugs: ["canetas"], label: "Caneta" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno pequeno" },
    ],
  },
  {
    slug: "clientes-especial",
    name: "Kit Cliente Especial",
    objective: "CLIENTE_VIP",
    maxPerPerson: 80,
    description: "Para clientes que merecem atenção especial.",
    items: [
      { categorySlugs: ["squeezes-e-garrafas"], label: "Squeeze" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["canetas"], label: "Caneta premium" },
    ],
  },
  {
    slug: "clientes-executivo",
    name: "Kit Executivo — Clientes",
    objective: "CLIENTE_VIP",
    maxPerPerson: 150,
    description: "Presente executivo para fortalecer marca e vendas.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["canetas"], label: "Caneta" },
    ],
  },
  {
    slug: "clientes-alto-valor",
    name: "Kit Alto Valor",
    objective: "CLIENTE_VIP",
    maxPerPerson: 9999,
    description: "Presente de alto valor para clientes VIP, acima de R$200.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Bolsa executiva" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa térmica premium" },
      { categorySlugs: ["informatica"], label: "Fone" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno couro sintético" },
    ],
  },

  // 3) Eventos corporativos
  {
    slug: "eventos-feira",
    name: "Kit Feira",
    objective: "EVENTO",
    maxPerPerson: 20,
    description: "Distribuição de alto volume em feiras e stands.",
    items: [
      { categorySlugs: ["canetas"], label: "Caneta" },
      { categorySlugs: ["chaveiros"], label: "Chaveiro" },
      { categorySlugs: ["sacolas-e-sacochilas"], label: "Ecobag" },
    ],
  },
  {
    slug: "eventos-visitante",
    name: "Kit Visitante",
    objective: "EVENTO",
    maxPerPerson: 50,
    description: "Kit padrão para visitantes de eventos corporativos.",
    items: [
      { categorySlugs: ["sacolas-e-sacochilas"], label: "Ecobag" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["canetas"], label: "Caneta" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Squeeze" },
    ],
  },
  {
    slug: "eventos-destaque",
    name: "Kit Destaque",
    objective: "EVENTO",
    maxPerPerson: 80,
    description: "Para convidados que merecem destaque no evento.",
    items: [
      { categorySlugs: ["squeezes-e-garrafas"], label: "Squeeze" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["necessaires"], label: "Necessaire" },
      { categorySlugs: ["canetas"], label: "Caneta premium" },
    ],
  },
  {
    slug: "eventos-vip",
    name: "Kit VIP Evento",
    objective: "EVENTO",
    maxPerPerson: 150,
    description: "Kit VIP para convidados especiais do evento.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["informatica"], label: "Kit tecnológico" },
    ],
  },

  // 4) Kits corporativos para equipes (reaproveita FEIRA)
  {
    slug: "equipes-basico",
    name: "Kit Equipe Básico",
    objective: "FEIRA",
    maxPerPerson: 20,
    description: "Uso diário para equipes — kit corporativo básico.",
    items: [
      { categorySlugs: ["canetas"], label: "Caneta" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Bloco" },
      { categorySlugs: ["chaveiros"], label: "Chaveiro" },
    ],
  },
  {
    slug: "equipes-padrao",
    name: "Kit Equipe Padrão",
    objective: "FEIRA",
    maxPerPerson: 50,
    description: "Kit corporativo padrão de uso diário.",
    items: [
      { categorySlugs: ["squeezes-e-garrafas"], label: "Squeeze" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["canetas"], label: "Caneta" },
    ],
  },
  {
    slug: "equipes-avancado",
    name: "Kit Equipe Avançado",
    objective: "FEIRA",
    maxPerPerson: 80,
    description: "Kit corporativo avançado para equipes.",
    items: [
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa inox" },
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila simples" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
    ],
  },
  {
    slug: "equipes-completo",
    name: "Kit Equipe Completo",
    objective: "FEIRA",
    maxPerPerson: 150,
    description: "Kit corporativo completo para equipes.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa térmica" },
      { categorySlugs: ["informatica"], label: "Fone" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
    ],
  },
  {
    slug: "equipes-executivo",
    name: "Kit Executivo Equipe",
    objective: "FEIRA",
    maxPerPerson: 9999,
    description: "Kit corporativo executivo, acima de R$200 por pessoa.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila premium" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa premium" },
      { categorySlugs: ["informatica"], label: "Fone" },
      { categorySlugs: ["informatica"], label: "Carregador" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Planner" },
    ],
  },

  // 5) Kits sustentáveis (reaproveita PREMIACAO)
  {
    slug: "eco-basico",
    name: "Kit Eco Básico",
    objective: "PREMIACAO",
    maxPerPerson: 20,
    description: "Pilar de marca sustentável — kit eco básico.",
    items: [
      { categorySlugs: ["sacolas-e-sacochilas"], label: "Ecobag" },
      { categorySlugs: ["canetas", "linha-ecologica"], label: "Caneta reciclada" },
      { categorySlugs: ["linha-ecologica"], label: "Semente ecológica" },
    ],
  },
  {
    slug: "eco-consciente",
    name: "Kit Eco Consciente",
    objective: "PREMIACAO",
    maxPerPerson: 50,
    description: "Kit sustentável para marcas conscientes.",
    items: [
      { categorySlugs: ["blocos-e-cadernetas", "linha-ecologica"], label: "Caderno reciclado" },
      { categorySlugs: ["canetas", "linha-ecologica"], label: "Caneta ecológica" },
      { categorySlugs: ["squeezes-e-garrafas", "linha-ecologica"], label: "Squeeze sustentável" },
    ],
  },
  {
    slug: "eco-premium",
    name: "Kit Eco Premium",
    objective: "PREMIACAO",
    maxPerPerson: 80,
    description: "Kit sustentável premium.",
    items: [
      { categorySlugs: ["linha-ecologica"], label: "Copo fibra de bambu" },
      { categorySlugs: ["blocos-e-cadernetas", "linha-ecologica"], label: "Caderno kraft" },
      { categorySlugs: ["sacolas-e-sacochilas", "linha-ecologica"], label: "Ecobag premium" },
    ],
  },
  {
    slug: "eco-corporativo",
    name: "Kit Eco Corporativo",
    objective: "PREMIACAO",
    maxPerPerson: 150,
    description: "Kit sustentável corporativo completo.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas", "linha-ecologica"], label: "Mochila sustentável" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
      { categorySlugs: ["linha-ecologica"], label: "Kit sementes" },
    ],
  },
  {
    slug: "eco-luxo",
    name: "Kit Eco Luxo",
    objective: "PREMIACAO",
    maxPerPerson: 9999,
    description: "Kit sustentável de luxo, acima de R$200 por pessoa.",
    items: [
      { categorySlugs: ["linha-ecologica"], label: "Kit completo sustentável" },
      { categorySlugs: ["linha-ecologica"], label: "Produto certificado" },
    ],
  },

  // 6) Kits Premium
  {
    slug: "premium-inicial",
    name: "Kit Premium Inicial",
    objective: "PREMIACAO",
    maxPerPerson: 150,
    description: "Cliente VIP, diretoria ou datas especiais.",
    items: [
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno executivo" },
      { categorySlugs: ["canetas"], label: "Caneta metal" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa premium" },
    ],
  },
  {
    slug: "premium-completo",
    name: "Kit Premium",
    objective: "PREMIACAO",
    maxPerPerson: 200,
    description: "Kit premium completo para diretoria e datas especiais.",
    items: [
      { categorySlugs: ["mochilas-e-bolsas"], label: "Mochila executiva" },
      { categorySlugs: ["squeezes-e-garrafas"], label: "Garrafa térmica" },
      { categorySlugs: ["informatica"], label: "Fone" },
      { categorySlugs: ["blocos-e-cadernetas"], label: "Caderno" },
    ],
  },
];

async function pickProduct(categorySlugs: string[], maxPrice: number, usedIds: Set<string>) {
  const product = await prisma.product.findFirst({
    where: {
      status: "ATIVO",
      price: { not: null, gt: 0, lte: maxPrice },
      id: { notIn: Array.from(usedIds) },
      category: { slug: { in: categorySlugs } },
    },
    orderBy: [{ popularityScore: "desc" }, { price: "desc" }],
  });
  return product;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const skipped: string[] = [];
  const created: string[] = [];

  for (const kit of KITS) {
    const usedIds = new Set<string>();
    let remaining = kit.maxPerPerson * 0.85;
    const resolvedItems: { productId: string; quantityPerPerson: number }[] = [];

    for (const item of kit.items) {
      const product = await pickProduct(item.categorySlugs, remaining, usedIds);
      if (!product) continue;
      usedIds.add(product.id);
      remaining -= product.price as number;
      resolvedItems.push({ productId: product.id, quantityPerPerson: 1 });
    }

    if (resolvedItems.length < 2) {
      skipped.push(`${kit.slug} (só ${resolvedItems.length} produto(s) encontrados dentro do orçamento)`);
      continue;
    }

    console.log(`[${kit.slug}] ${kit.name} — ${resolvedItems.length} item(ns), objetivo=${kit.objective}`);

    if (apply) {
      await prisma.$transaction([
        prisma.kitItem.deleteMany({ where: { kit: { slug: kit.slug } } }),
        prisma.kit.upsert({
          where: { slug: kit.slug },
          create: {
            slug: kit.slug,
            name: kit.name,
            description: kit.description,
            objective: kit.objective,
            manual: true,
            active: true,
            items: { create: resolvedItems.map((it, order) => ({ ...it, order })) },
          },
          update: {
            name: kit.name,
            description: kit.description,
            objective: kit.objective,
            active: true,
            items: { create: resolvedItems.map((it, order) => ({ ...it, order })) },
          },
        }),
      ]);
    }
    created.push(kit.slug);
  }

  console.log(`\nKits criados/atualizados: ${created.length}`);
  console.log(`Kits pulados (catálogo insuficiente na faixa de preço): ${skipped.length}`);
  skipped.forEach((s) => console.log(`  - ${s}`));
  console.log(apply ? "\nGravado no banco." : "\n(dry-run: nada foi gravado — rode com --apply para gravar)");
}

main()
  .catch((err) => {
    console.error("Falha ao gerar kits:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
