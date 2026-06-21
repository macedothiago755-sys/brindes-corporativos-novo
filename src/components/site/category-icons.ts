import {
  Briefcase,
  ChefHat,
  Coffee,
  Crown,
  Cpu,
  CupSoda,
  Dumbbell,
  Flame,
  Frame,
  Leaf,
  Package,
  PartyPopper,
  PawPrint,
  PenLine,
  Shirt,
  ShoppingBag,
  Sofa,
  Tag,
  ToyBrick,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  brinquedos: ToyBrick,
  canecas: Coffee,
  canetas: PenLine,
  "casa e decoracao": Sofa,
  copos: CupSoda,
  escritorio: Briefcase,
  espelhos: Frame,
  esporte: Dumbbell,
  eventos: PartyPopper,
  "kit churrasco": Flame,
  "kits corporativos": Package,
  "linha pet": PawPrint,
  "moda e estilo": Shirt,
  petisqueiras: UtensilsCrossed,
  plaquinhas: Tag,
  premium: Crown,
  "sacolas e sacochilas": ShoppingBag,
  sustentaveis: Leaf,
  tecnologia: Cpu,
  tabuas: ChefHat,
  utilidades: Wrench,
};

export function normalizeCategoryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function getCategoryIcon(name: string): LucideIcon {
  return categoryIcons[normalizeCategoryName(name)] ?? Package;
}

const PRIORITY_GROUPS: { keywords: string[] }[] = [
  { keywords: ["caneta"] },
  { keywords: ["caneca"] },
  { keywords: ["caderno", "caderneta"] },
  { keywords: ["squeeze", "garrafa"] },
  { keywords: ["sustent"] },
  { keywords: ["sacola"] },
];

export function splitCategories<T extends { name: string }>(categories: T[], mainCount = 5) {
  const normalized = categories.map((c) => normalizeCategoryName(c.name));
  const selected = new Set<number>();
  const main: T[] = [];

  for (const group of PRIORITY_GROUPS) {
    if (main.length >= mainCount) break;
    const idx = normalized.findIndex((n, i) => !selected.has(i) && group.keywords.some((k) => n.includes(k)));
    if (idx !== -1) {
      selected.add(idx);
      main.push(categories[idx]);
    }
  }

  for (let i = 0; i < categories.length && main.length < mainCount; i++) {
    if (!selected.has(i)) {
      selected.add(i);
      main.push(categories[i]);
    }
  }

  const rest = categories.filter((_, i) => !selected.has(i));
  return { main, rest };
}

const MOBILE_FEATURED_KEYWORDS = ["escritorio", "tecnologia", "sustent", "evento"];

/** Categorias priorizadas para o grid compacto 2x2 do mobile. */
export function pickFeaturedCategories<T extends { name: string }>(categories: T[], count = 4) {
  const normalized = categories.map((c) => normalizeCategoryName(c.name));
  const selected = new Set<number>();
  const picked: T[] = [];

  for (const keyword of MOBILE_FEATURED_KEYWORDS) {
    if (picked.length >= count) break;
    const idx = normalized.findIndex((n, i) => !selected.has(i) && n.includes(keyword));
    if (idx !== -1) {
      selected.add(idx);
      picked.push(categories[idx]);
    }
  }

  for (let i = 0; i < categories.length && picked.length < count; i++) {
    if (!selected.has(i)) {
      selected.add(i);
      picked.push(categories[i]);
    }
  }

  return picked;
}
