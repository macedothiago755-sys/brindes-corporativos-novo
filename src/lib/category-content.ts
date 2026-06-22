import type { FaqItem } from "@/components/site/faq-section";

/**
 * Texto introdutório único por categoria (indexado por slug).
 *
 * Objetivo de SEO: as URLs de categoria (`/categoria/...`) são as de
 * maior intenção comercial ("canecas personalizadas", "brindes ecológicos").
 * Sem texto próprio elas ficam "magras" para o Google. Cada parágrafo aqui é
 * único e responde à intenção de busca + casos de uso da categoria.
 */
const categoryIntros: Record<string, string> = {
  "blocos-e-cadernetas":
    "Blocos de anotações e cadernetas personalizados com a marca da sua empresa são brindes úteis para o dia a dia corporativo — ideais para reuniões, treinamentos, eventos e kits de boas-vindas. Escolha capas, miolos e acabamentos e aplique seu logo com a personalização que combina com cada modelo.",
  "bolsas-termicas":
    "Bolsas térmicas personalizadas mantêm alimentos e bebidas na temperatura ideal e acompanham seu cliente em viagens, eventos e no dia a dia, garantindo presença prolongada da sua marca. São uma opção prática e de alto valor percebido para ações corporativas e datas comemorativas.",
  canecas:
    "Canecas personalizadas estão entre os brindes corporativos mais procurados: úteis, duráveis e com grande área para a sua marca. Disponíveis em cerâmica, porcelana, inox e modelos térmicos, são perfeitas para kits de boas-vindas, eventos e campanhas internas.",
  canetas:
    "Canetas personalizadas são o brinde corporativo clássico — econômicas em grande volume e com ótimo alcance de marca em feiras, eventos e ações promocionais. Há desde modelos plásticos até canetas executivas em metal para presentear clientes e parceiros.",
  chaveiros:
    "Chaveiros personalizados são brindes de baixo custo e alta circulação: acompanham o cliente todos os dias e reforçam a lembrança da sua marca. Ideais para grandes tiragens, eventos e ações de relacionamento.",
  "conjuntos-executivos":
    "Conjuntos executivos personalizados reúnem itens como canetas, cadernos e acessórios em um kit de alto padrão — perfeitos para presentear clientes VIP, diretores e parceiros estratégicos. Uma escolha premium que comunica cuidado e valoriza a sua marca.",
  cozinha:
    "Brindes de cozinha personalizados unem utilidade e presença diária da marca na casa do seu cliente. De utensílios a acessórios, são ótimos para ações de relacionamento, datas comemorativas e kits corporativos.",
  "cuidados-pessoais":
    "Brindes de cuidados pessoais personalizados — itens de higiene, beleza e bem-estar — são lembranças próximas e afetivas para colaboradores e clientes. Combinam bem com kits de boas-vindas, ações de RH e campanhas de saúde corporativa.",
  escritorio:
    "Brindes de escritório personalizados acompanham o cliente no ambiente de trabalho, garantindo exposição constante da sua marca. Organizadores, acessórios e itens de mesa são ideais para kits corporativos, eventos e ações de endomarketing.",
  esportes:
    "Brindes esportivos personalizados associam a sua marca a saúde, energia e qualidade de vida. São ótimos para ações de bem-estar corporativo, patrocínios, eventos e campanhas voltadas a um público ativo.",
  ferramentas:
    "Ferramentas personalizadas são brindes resistentes e de alto valor utilitário — kits, multiferramentas e acessórios que acompanham o cliente por anos. Indicadas para os setores industrial, automotivo e da construção, e para ações de relacionamento duradouras.",
  "guarda-chuva":
    "Guarda-chuvas personalizados oferecem grande área de marca e altíssima visibilidade nos dias de chuva, dentro e fora da empresa. Um brinde prático e elegante para clientes, colaboradores e eventos corporativos.",
  informatica:
    "Brindes de informática e tecnologia personalizados — pen drives, mouse pads, carregadores e acessórios — são modernos, úteis e muito valorizados. Perfeitos para kits de onboarding, eventos de tecnologia e presentes corporativos.",
  "kit-churrasco":
    "Kits de churrasco personalizados são presentes corporativos de alto valor percebido, ideais para premiações, clientes VIP e datas especiais. Reúnem utensílios e acessórios com a sua marca em uma apresentação que encanta.",
  "kit-queijo":
    "Kits de queijo personalizados são brindes sofisticados para presentear clientes, parceiros e colaboradores em ocasiões especiais. Uma escolha elegante que combina requinte e utilidade, com a marca da sua empresa em destaque.",
  "linha-ecologica":
    "A linha ecológica reúne brindes sustentáveis personalizados, feitos com materiais reciclados, recicláveis ou de origem responsável. São ideais para empresas que querem reforçar o compromisso ambiental da marca em eventos e ações corporativas.",
  "linha-feminina":
    "A linha feminina reúne brindes personalizados pensados para o público feminino, com design e itens que valorizam cada ação de relacionamento. Ótimos para campanhas, datas comemorativas e presentes corporativos.",
  "linha-masculina":
    "A linha masculina reúne brindes personalizados voltados ao público masculino, com itens de uso prático e visual marcante. Indicados para presentear clientes, parceiros e colaboradores em ações corporativas.",
  "linha-pet":
    "A linha pet reúne brindes personalizados para os animais de estimação dos seus clientes e colaboradores — uma forma afetiva e memorável de aproximar a sua marca. Perfeita para ações de relacionamento e campanhas com forte apelo emocional.",
  "mochilas-e-bolsas":
    "Mochilas e bolsas personalizadas combinam utilidade, durabilidade e grande área de marca em movimento. São ideais para kits de onboarding, eventos, viagens corporativas e premiações.",
  necessaires:
    "Nécessaires personalizadas são brindes práticos e versáteis para viagens e o dia a dia, com ótima exposição da marca. Combinam com kits corporativos, ações de RH e presentes para clientes.",
  "sacolas-e-sacochilas":
    "Ecobags, sacolas e sacochilas personalizadas são brindes sustentáveis de alta circulação — a sua marca em movimento pela cidade. Ideais para eventos, feiras, lojas e ações de marca com apelo ecológico.",
  "squeezes-e-garrafas":
    "Squeezes e garrafas personalizadas acompanham o cliente na academia, no trabalho e nas viagens, reforçando hidratação e estilo de vida saudável. Um brinde durável e de uso diário, com grande presença de marca.",
};

export function getCategoryIntro(slug: string): string | null {
  return categoryIntros[slug] ?? null;
}

/**
 * FAQ contextual por categoria. Responde às dúvidas reais do comprador B2B
 * (quantidade mínima, personalização, prazo, entrega) e emite schema FAQPage
 * na URL da categoria — sinal forte para Google e buscas por IA (GEO).
 */
export function getCategoryFaq(categoryName: string): FaqItem[] {
  const nome = categoryName.toLowerCase();
  return [
    {
      question: `Qual a quantidade mínima para ${nome} personalizadas?`,
      answer:
        "A quantidade mínima varia conforme o produto e o tipo de personalização. Cada item exibe o pedido mínimo na sua página, e o time comercial ajuda a ajustar ao volume da sua empresa.",
    },
    {
      question: `Como funciona a personalização com a marca da minha empresa?`,
      answer:
        "Trabalhamos com gravação a laser, silk screen, bordado, impressão UV e transfer, escolhidos conforme o material do produto. Você envia a sua arte, nós validamos e só produzimos após a sua aprovação.",
    },
    {
      question: `Vocês entregam em São Paulo e em todo o Brasil?`,
      answer:
        "Sim. Atendemos empresas na capital e na região metropolitana de São Paulo e enviamos para todo o Brasil, com prazo de produção e entrega combinado por projeto.",
    },
  ];
}
