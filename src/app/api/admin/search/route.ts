import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [products, categories, quotes] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }],
      },
      select: { id: true, name: true, sku: true },
      take: 5,
    }),
    prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true },
      take: 5,
    }),
    prisma.quote.findMany({
      where: {
        OR: [
          { clienteNome: { contains: q, mode: "insensitive" } },
          { empresa: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, clienteNome: true, empresa: true, status: true },
      take: 5,
    }),
  ]);

  const results = [
    ...products.map((p) => ({
      group: "Produtos",
      label: p.name,
      sublabel: p.sku ?? undefined,
      href: `/admin/produtos/${p.id}`,
    })),
    ...categories.map((c) => ({
      group: "Categorias",
      label: c.name,
      href: `/admin/categorias`,
    })),
    ...quotes.map((q) => ({
      group: "Orçamentos",
      label: `${q.clienteNome} · ${q.empresa}`,
      sublabel: q.status,
      href: `/admin/orcamentos/${q.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
