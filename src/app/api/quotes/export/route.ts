import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const quotes = await prisma.quote.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = "Cliente,Empresa,Email,Telefone,Produto,Quantidade,Status,Cupom,Data\n";
  const rows = quotes
    .map((q) =>
      [
        q.clienteNome,
        q.empresa,
        q.email,
        q.telefone,
        q.items[0]?.product.name ?? "",
        q.items[0]?.quantidade ?? "",
        q.status,
        q.couponCode ?? "",
        q.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orcamentos.csv",
    },
  });
}
