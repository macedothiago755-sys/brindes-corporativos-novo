export interface VitrineConfig {
  slug: string;
  title: string;
  description: string;
  tag?: string;
  newest?: boolean;
}

export const VITRINES: VitrineConfig[] = [
  {
    slug: "novidades",
    title: "Novidades",
    description: "Os produtos mais recentes do nosso catálogo.",
    newest: true,
  },
  {
    slug: "mais-vendidos",
    title: "Mais vendidos",
    description: "Os brindes corporativos preferidos pelos nossos clientes.",
    tag: "mais vendido",
  },
  {
    slug: "promocao",
    title: "Promoção",
    description: "Ofertas e condições especiais por tempo limitado.",
    tag: "promoção",
  },
  {
    slug: "corporativo",
    title: "Corporativo",
    description: "Brindes pensados para empresas, eventos e onboarding.",
    tag: "corporativo",
  },
];

export function getVitrine(slug: string) {
  return VITRINES.find((v) => v.slug === slug);
}
