import { prisma } from "@/lib/prisma";
import type { ProductObjective } from "@prisma/client";

const SAFETY_MARGIN = 0.85; // reserva ~15% para frete, personalização e variações

export type KitRecommendationItem = {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
  };
  quantityPerPerson: number;
};

export type KitRecommendation = {
  targetPerPerson: number;
  totalPerPerson: number;
  totalBudget: number;
  totalGeral: number;
  marginPerPerson: number;
  items: KitRecommendationItem[];
};

function bestCombo(
  candidates: { id: string; price: number }[],
  target: number
): string[] {
  const pool = candidates.slice(0, 12);
  let best: { ids: string[]; total: number } = { ids: [], total: 0 };

  function search(start: number, current: string[], total: number) {
    if (total > target) return;
    if (
      total > best.total ||
      (total === best.total && current.length > best.ids.length)
    ) {
      best = { ids: [...current], total };
    }
    if (current.length >= 4) return;
    for (let i = start; i < pool.length; i++) {
      current.push(pool[i].id);
      search(i + 1, current, total + pool[i].price);
      current.pop();
    }
  }

  search(0, [], 0);
  return best.ids;
}

export async function recommendKit(params: {
  objective: ProductObjective;
  quantity: number;
  budgetPerPerson: number;
}): Promise<KitRecommendation | null> {
  const { objective, quantity, budgetPerPerson } = params;
  const target = budgetPerPerson * SAFETY_MARGIN;

  let products = await prisma.product.findMany({
    where: { status: "ATIVO", price: { not: null }, objectives: { has: objective } },
    orderBy: [{ popularityScore: "desc" }, { price: "asc" }],
  });

  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: { status: "ATIVO", price: { not: null, lte: target } },
      orderBy: [{ popularityScore: "desc" }, { price: "asc" }],
    });
  }

  const candidates = products
    .filter((p) => (p.price ?? 0) > 0 && (p.price ?? 0) <= target)
    .map((p) => ({ id: p.id, price: p.price as number }));

  if (candidates.length === 0) return null;

  const comboIds = bestCombo(candidates, target);
  if (comboIds.length === 0) return null;

  const byId = new Map(products.map((p) => [p.id, p]));
  const items: KitRecommendationItem[] = comboIds.map((id) => {
    const p = byId.get(id)!;
    return {
      product: { id: p.id, name: p.name, slug: p.slug, images: p.images, price: p.price as number },
      quantityPerPerson: 1,
    };
  });

  const totalPerPerson = items.reduce((sum, i) => sum + i.product.price * i.quantityPerPerson, 0);

  return {
    targetPerPerson: target,
    totalPerPerson,
    totalBudget: budgetPerPerson * quantity,
    totalGeral: totalPerPerson * quantity,
    marginPerPerson: budgetPerPerson - totalPerPerson,
    items,
  };
}
