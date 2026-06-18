import { PrismaClient, CustomizationMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CategoryNode = { name: string; slug: string; children?: CategoryNode[] };

const categoryTree: CategoryNode[] = [
  { name: "Escritório", slug: "escritorio" },
  { name: "Tecnologia", slug: "tecnologia" },
  { name: "Utilidades", slug: "utilidades" },
  { name: "Eventos", slug: "eventos" },
  { name: "Kits Corporativos", slug: "kits-corporativos" },
  { name: "Sustentáveis", slug: "sustentaveis" },
  { name: "Premium", slug: "premium" },
  { name: "Brinquedos", slug: "brinquedos" },
  { name: "Plaquinhas", slug: "plaquinhas" },
  { name: "Casa e Decoração", slug: "casa-e-decoracao" },
  {
    name: "Moda e Estilo",
    slug: "moda-e-estilo",
    children: [
      { name: "Chapéu", slug: "chapeu" },
      { name: "Boné", slug: "bone" },
      { name: "Viseira", slug: "viseira" },
      { name: "Óculos", slug: "oculos" },
      { name: "Pulseira", slug: "pulseira" },
    ],
  },
  { name: "Esporte", slug: "esporte" },
  {
    name: "Espelhos",
    slug: "espelhos",
    children: [
      { name: "Espelho de Mesa", slug: "espelho-de-mesa" },
      { name: "Espelho de Bolso", slug: "espelho-de-bolso" },
      { name: "Espelho de Parede", slug: "espelho-de-parede" },
    ],
  },
  {
    name: "Sacolas e Sacochilas",
    slug: "sacolas-e-sacochilas",
    children: [
      { name: "Sacochilas", slug: "sacochilas" },
      { name: "TNT", slug: "sacolas-tnt" },
      { name: "Algodão", slug: "sacolas-algodao" },
      { name: "Poliéster", slug: "sacolas-poliester" },
      { name: "Metalizadas", slug: "sacolas-metalizadas" },
      { name: "Plástico", slug: "sacolas-plastico" },
      { name: "Linho", slug: "sacolas-linho" },
      { name: "Lona", slug: "sacolas-lona" },
      { name: "Feltro", slug: "sacolas-feltro" },
      { name: "Kraft", slug: "sacolas-kraft" },
      { name: "Microfibra", slug: "sacolas-microfibra" },
      { name: "Sacolas", slug: "sacolas-padrao" },
    ],
  },
  {
    name: "Linha Pet",
    slug: "linha-pet",
    children: [
      { name: "Bebedouros", slug: "pet-bebedouros" },
      { name: "Tigelas", slug: "pet-tigelas" },
      { name: "Saquinho", slug: "pet-saquinho" },
      { name: "Identificação", slug: "pet-identificacao" },
      { name: "Brinquedos Pet", slug: "pet-brinquedos" },
    ],
  },
  { name: "Tábuas", slug: "tabuas" },
  {
    name: "Copos",
    slug: "copos",
    children: [
      { name: "Taça", slug: "copos-taca" },
      { name: "Porta Copos", slug: "copos-porta-copos" },
      { name: "Térmicos", slug: "copos-termicos" },
      { name: "Coqueteleira", slug: "copos-coqueteleira" },
      { name: "Silicone", slug: "copos-silicone" },
      { name: "Bambu", slug: "copos-bambu" },
      { name: "Inox", slug: "copos-inox" },
      { name: "Plástico", slug: "copos-plastico" },
      { name: "Vidro", slug: "copos-vidro" },
      { name: "Parede Dupla", slug: "copos-parede-dupla" },
      { name: "Ecológicos", slug: "copos-ecologicos" },
    ],
  },
  { name: "Petisqueiras", slug: "petisqueiras" },
  {
    name: "Kit Churrasco",
    slug: "kit-churrasco",
    children: [
      { name: "Churrasqueira Portátil", slug: "churrasqueira-portatil" },
      { name: "Estojo de Nylon", slug: "estojo-de-nylon" },
      { name: "Maletas", slug: "maletas-churrasco" },
      { name: "Avental", slug: "avental-churrasco" },
      { name: "Garra para Churrasco", slug: "garra-para-churrasco" },
      { name: "Kit Tábua", slug: "kit-tabua" },
    ],
  },
  {
    name: "Canecas",
    slug: "canecas",
    children: [
      { name: "Vidro", slug: "canecas-vidro" },
      { name: "Alumínio", slug: "canecas-aluminio" },
      { name: "Bambu", slug: "canecas-bambu" },
      { name: "Acrílica", slug: "canecas-acrilica" },
      { name: "Plástica", slug: "canecas-plastica" },
      { name: "Porcelana", slug: "canecas-porcelana" },
      { name: "Inox", slug: "canecas-inox" },
      { name: "Térmica", slug: "canecas-termica" },
    ],
  },
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

const blogPosts: { title: string; slug: string; excerpt: string; content: string; coverImage: string; tags: string[] }[] = [
  {
    title: "Como escolher o brinde corporativo ideal para sua empresa",
    slug: "como-escolher-o-brinde-corporativo-ideal",
    excerpt:
      "Descubra os critérios essenciais para selecionar brindes personalizados que realmente fortalecem a imagem da sua marca.",
    coverImage: "/banners/banner-3-garrafa-1014x535.jpg",
    tags: ["brindes corporativos", "estratégia de marketing"],
    content: `Escolher o brinde corporativo certo vai muito além de comprar um item com a logo da empresa. Um brinde bem planejado comunica os valores da marca, gera lembrança positiva e pode até influenciar decisões de compra futuras.

O primeiro passo é definir o objetivo da ação: fortalecer relacionamento com clientes, engajar colaboradores em um evento interno ou apresentar a marca em uma feira? Cada objetivo pede um tipo de brinde diferente.

Em seguida, conheça o público. Brindes tecnológicos como carregadores portáteis e fones bluetooth funcionam bem para públicos corporativos jovens, enquanto kits executivos em couro tendem a ser mais adequados para parceiros de alto nível hierárquico.

Outro fator decisivo é a qualidade. Um brinde malfeito pode gerar o efeito contrário ao desejado, associando a marca a algo descartável. Por isso, prefira fornecedores que oferecem controle de qualidade rigoroso e materiais duráveis.

Por fim, pense na personalização. Gravação a laser, bordado e impressão UV são técnicas que aumentam a percepção de valor do produto e garantem que a marca apareça de forma elegante, sem parecer exagerada.

Na nossa loja você encontra brindes personalizados para todas essas necessidades, com orçamento sob medida para o volume e prazo do seu projeto.`,
  },
  {
    title: "Brindes sustentáveis: tendência que fortalece a marca e o planeta",
    slug: "brindes-sustentaveis-tendencia-marca-planeta",
    excerpt:
      "Entenda por que os brindes ecológicos estão em alta e como usá-los para construir uma reputação de marca responsável.",
    coverImage: "/banners/banner-5-caderno-1014x535.jpg",
    tags: ["sustentabilidade", "brindes ecológicos"],
    content: `A sustentabilidade deixou de ser um diferencial e se tornou uma expectativa do consumidor. Empresas que adotam brindes ecológicos comunicam responsabilidade ambiental e se conectam com um público cada vez mais atento ao impacto de suas escolhas.

Itens como ecobags em algodão orgânico, cadernos em papel reciclado e copos reutilizáveis em bambu são exemplos de brindes que aliam funcionalidade no dia a dia com baixo impacto ambiental.

Além do material, vale considerar o ciclo de vida do produto. Brindes duráveis, que serão usados por meses ou anos, têm uma pegada ambiental proporcionalmente menor do que itens descartáveis usados uma única vez.

Comunicar a escolha sustentável também faz parte da estratégia. Uma etiqueta explicando a origem do material reciclado ou o motivo da escolha do brinde reforça a mensagem e aumenta o engajamento do público com a marca.

Se sua empresa quer alinhar a comunicação visual com práticas sustentáveis, vale explorar nossa categoria de brindes sustentáveis, com opções para todos os orçamentos.`,
  },
  {
    title: "Brindes para Copa do Mundo: como aproveitar o clima de torcida",
    slug: "brindes-para-copa-do-mundo-clima-de-torcida",
    excerpt:
      "Saiba como criar campanhas de brindes temáticos para grandes eventos esportivos e aumentar o engajamento da equipe e dos clientes.",
    coverImage: "/banners/banner-7-copa1-1014x535.jpg",
    tags: ["eventos", "marketing esportivo"],
    content: `Grandes eventos esportivos como a Copa do Mundo movimentam emoções em massa e criam uma oportunidade única para as marcas se conectarem com seu público de forma leve e divertida.

Bonés, ecobags, squeezes e power banks personalizados com as cores do time ou da seleção criam um clima de torcida dentro da empresa e fortalecem o senso de pertencimento entre colaboradores.

Para ações com clientes, kits temáticos — combinando itens práticos como garrafas térmicas e ventiladores portáteis com elementos visuais da competição — costumam gerar alto engajamento em redes sociais, já que as pessoas compartilham espontaneamente esse tipo de brinde.

O segredo está no timing: planeje a compra e a personalização dos brindes com antecedência, já que a demanda por esse tipo de produto cresce exponencialmente nas semanas que antecedem o evento.

Conheça nossa seleção de brindes temáticos para grandes eventos esportivos e garanta a sua reserva antes da torcida começar.`,
  },
  {
    title: "Kits de boas-vindas: a primeira impressão que fideliza colaboradores",
    slug: "kits-de-boas-vindas-fideliza-colaboradores",
    excerpt:
      "Veja como montar um kit de onboarding memorável que reduz o turnover e fortalece a cultura organizacional.",
    coverImage: "/banners/banner-6-churrasco-1014x535.jpg",
    tags: ["recursos humanos", "kits corporativos"],
    content: `O primeiro dia de trabalho é determinante para a percepção que um novo colaborador terá da empresa. Um kit de boas-vindas bem planejado transmite cuidado, organização e valorização das pessoas desde o primeiro contato.

Itens como caderno personalizado, caneca exclusiva, garrafa térmica e um cartão de boas-vindas assinado pela liderança criam uma experiência afetiva que vai além do material em si.

Empresas que investem nesse tipo de ação relatam maior engajamento nos primeiros meses e redução na taxa de turnover, já que o colaborador sente que faz parte de algo desde o início.

Vale também pensar no kit como uma extensão da cultura da empresa: startups podem optar por itens descontraídos, enquanto empresas mais tradicionais tendem a preferir kits executivos com acabamento premium.

Conheça nossos kits corporativos prontos para personalização e simplifique o processo de onboarding da sua equipe.`,
  },
  {
    title: "Canecas personalizadas: o brinde clássico que nunca sai de moda",
    slug: "canecas-personalizadas-brinde-classico",
    excerpt:
      "Entenda por que as canecas continuam entre os brindes mais pedidos e como escolher o material ideal para cada ocasião.",
    coverImage: "/banners/banner-2-bolsa-1014x535.jpg",
    tags: ["canecas", "brindes promocionais"],
    content: `Poucos brindes têm um custo-benefício tão alto quanto a caneca personalizada. Usada diariamente em casa ou no escritório, ela mantém a marca visível por muito mais tempo do que a maioria dos brindes promocionais.

A escolha do material muda completamente a percepção do produto: canecas de porcelana têm um apelo mais sofisticado, ideais para presentes corporativos de fim de ano, enquanto versões em inox ou térmica agregam valor funcional para o dia a dia.

Modelos em bambu e outros materiais sustentáveis têm crescido em popularidade entre empresas que querem alinhar o brinde a uma comunicação mais consciente.

A área de impressão também merece atenção: técnicas como sublimação e gravação a laser garantem durabilidade do design mesmo após o uso em lava-louças ou exposição a altas temperaturas.

Explore nossa linha completa de canecas personalizadas, com opções em vidro, alumínio, bambu, acrílico, porcelana, inox e muito mais.`,
  },
  {
    title: "Brindes para home office: produtividade com a marca da sua empresa",
    slug: "brindes-para-home-office-produtividade",
    excerpt:
      "Confira os itens mais procurados por empresas que querem apoiar o trabalho remoto e ainda fortalecer a marca.",
    coverImage: "/banners/banner-4-squeeze-1014x535.jpg",
    tags: ["home office", "tecnologia"],
    content: `Com a consolidação do trabalho remoto e híbrido, os brindes voltados para o home office se tornaram uma categoria estratégica para empresas que querem cuidar do bem-estar e da produtividade dos colaboradores.

Itens como hubs USB-C, suportes para notebook, fones de ouvido bluetooth e iluminação de mesa ajudam a montar um ambiente de trabalho mais confortável e eficiente, ao mesmo tempo em que mantêm a marca presente no dia a dia da equipe.

Kits home office completos — combinando acessórios de tecnologia com itens de conforto, como squeeze e caderno — são uma ótima opção para ações de boas-vindas a novos colaboradores remotos ou para reconhecimento de equipes.

Além do impacto interno, esses brindes têm forte potencial de compartilhamento em redes sociais, já que colaboradores costumam fotografar seu setup de trabalho remoto.

Veja nossa seleção de brindes para home office e tecnologia personalizados para fortalecer a cultura da sua empresa à distância.`,
  },
  {
    title: "Guia rápido: prazos e quantidades mínimas em brindes personalizados",
    slug: "guia-prazos-quantidades-minimas-brindes-personalizados",
    excerpt:
      "Entenda como funcionam os prazos de produção e as quantidades mínimas para planejar sua próxima campanha de brindes sem surpresas.",
    coverImage: "/banners/banner-8-frasqueira-1014x535.jpg",
    tags: ["produção", "planejamento"],
    content: `Um dos erros mais comuns ao planejar uma campanha de brindes corporativos é subestimar o prazo de produção. Diferente de produtos de pronta entrega, brindes personalizados passam por etapas de aprovação de arte, produção e controle de qualidade antes do envio.

Em geral, prazos variam entre 10 e 25 dias úteis, dependendo da complexidade da personalização e do volume solicitado. Técnicas como bordado e gravação a laser tendem a levar mais tempo do que silk screen ou transfer.

As quantidades mínimas também variam por categoria de produto. Itens de papelaria costumam ter mínimos mais baixos, enquanto produtos eletrônicos personalizados exigem lotes maiores para viabilizar a produção.

Por isso, o ideal é solicitar o orçamento com antecedência mínima de 30 dias antes da data do evento ou da ação de relacionamento, garantindo tempo para ajustes na arte e eventual produção extra.

Ao solicitar seu orçamento em nosso catálogo, nossa equipe comercial já informa o prazo estimado e a quantidade mínima de cada produto, facilitando o planejamento da sua campanha.`,
  },
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
  await prisma.post.deleteMany();

  const categoryMap = new Map<string, string>();
  const leafSlugs: string[] = [];

  for (const node of categoryTree) {
    const created = await prisma.category.create({ data: { name: node.name, slug: node.slug } });
    categoryMap.set(node.slug, created.id);

    if (node.children?.length) {
      for (const child of node.children) {
        const createdChild = await prisma.category.create({
          data: { name: child.name, slug: child.slug, parentId: created.id },
        });
        categoryMap.set(child.slug, createdChild.id);
        leafSlugs.push(child.slug);
      }
    } else {
      leafSlugs.push(node.slug);
    }
  }

  let counter = 0;

  for (const p of productNames) {
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
        colors: colorPool[counter % colorPool.length],
        customizationMethods: methodsByPool[counter % methodsByPool.length],
        images: [`/products/placeholder-${(counter % 6) + 1}.svg`],
        minQty: [50, 100, 250, 500][counter % 4],
        leadTimeDays: [10, 15, 20, 25][counter % 4],
        dimensions: "Variável conforme modelo",
        printArea: "Área central frontal",
        sustainable: !!p.sustainable,
        premium: !!p.premium,
        featured: counter % 5 === 0,
        categoryId: categoryMap.get(p.categorySlug)!,
      },
    });
    counter++;
  }

  const namedLeafSlugs = new Set(productNames.map((p) => p.categorySlug));
  const flatNodes = categoryTree.flatMap((node) => node.children ?? [node]);

  for (const leaf of flatNodes) {
    if (namedLeafSlugs.has(leaf.slug)) continue;

    const productName = `${leaf.name} Personalizado(a)`;
    const slug = slugify(`${productName}-${leaf.slug}`);

    await prisma.product.create({
      data: {
        name: productName,
        slug,
        description: `${leaf.name} personalizado(a) com a identidade visual da sua marca. Produto pronto para personalização sob medida, ideal para brindes institucionais e ações promocionais.`,
        features: [
          "Produção em escala industrial",
          "Personalização sob medida",
          "Controle de qualidade rigoroso",
          "Embalagem para presente disponível",
        ],
        materials: ["Material premium", "Acabamento resistente"],
        colors: colorPool[counter % colorPool.length],
        customizationMethods: methodsByPool[counter % methodsByPool.length],
        images: [`/products/placeholder-${(counter % 6) + 1}.svg`],
        minQty: [50, 100, 250, 500][counter % 4],
        leadTimeDays: [10, 15, 20, 25][counter % 4],
        dimensions: "Variável conforme modelo",
        printArea: "Área central frontal",
        sustainable: false,
        premium: false,
        featured: counter % 7 === 0,
        categoryId: categoryMap.get(leaf.slug)!,
      },
    });
    counter++;
  }

  for (const post of blogPosts) {
    await prisma.post.create({ data: post });
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

  console.log(`Seed concluído: ${categoryMap.size} categorias, ${counter} produtos, ${blogPosts.length} posts e usuário admin criados.`);
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
