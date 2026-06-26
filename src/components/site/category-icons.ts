import {
  Backpack,
  Bath,
  Briefcase,
  BriefcaseBusiness,
  ChefHat,
  Coffee,
  Crown,
  Cpu,
  CupSoda,
  Droplets,
  Dumbbell,
  Flame,
  Flower2,
  Frame,
  GlassWater,
  Hammer,
  KeyRound,
  Leaf,
  Notebook,
  Package,
  PartyPopper,
  PawPrint,
  PenLine,
  Shirt,
  ShoppingBag,
  Sofa,
  Tag,
  ToyBrick,
  Umbrella,
  UtensilsCrossed,
  Wine,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  // Categorias oficiais (FASE 10)
  "blocos e cadernetas": Notebook,
  "bolsas termicas": Backpack,
  canecas: Coffee,
  canetas: PenLine,
  chaveiros: KeyRound,
  "conjuntos executivos": BriefcaseBusiness,
  cozinha: UtensilsCrossed,
  "cuidados pessoais": Bath,
  escritorio: Briefcase,
  esportes: Dumbbell,
  ferramentas: Hammer,
  "guarda-chuva": Umbrella,
  informatica: Cpu,
  "kit churrasco": Flame,
  "kit queijo": Wine,
  "linha ecologica": Leaf,
  "linha feminina": Flower2,
  "linha masculina": Shirt,
  "linha pet": PawPrint,
  "mochilas e bolsas": Backpack,
  necessaires: Droplets,
  "sacolas e sacochilas": ShoppingBag,
  "squeezes e garrafas": GlassWater,
  // Categorias legadas (mantidas como fallback caso ainda sejam exibidas)
  brinquedos: ToyBrick,
  "casa e decoracao": Sofa,
  copos: CupSoda,
  espelhos: Frame,
  esporte: Dumbbell,
  eventos: PartyPopper,
  "kits corporativos": Package,
  "moda e estilo": Shirt,
  petisqueiras: UtensilsCrossed,
  plaquinhas: Tag,
  premium: Crown,
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
  { keywords: ["ecologica"] },
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

const MOBILE_FEATURED_KEYWORDS = ["escritorio", "informatica", "ecologica", "esportes"];

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
