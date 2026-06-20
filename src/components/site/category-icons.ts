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
  { keywords: ["corporativ", "brinde"] },
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
