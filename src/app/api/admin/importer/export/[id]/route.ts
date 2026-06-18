import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, toXlsx, type ExportRow } from "@/lib/exporters";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

  const products = await prisma.importedProduct.findMany({
    where: { importJobId: id },
    orderBy: { createdAt: "asc" },
  });

  const rows: ExportRow[] = products.map((p) => ({
    nome: p.nome,
    codigo: p.codigo ?? "",
    categoria: p.categoria ?? "",
    descricao: p.descricaoIA || p.descricaoLonga || p.descricaoCurta || "",
    imagem: p.imagemPrincipal ?? "",
    atributos: Object.entries((p.dadosTecnicos as Record<string, string>) ?? {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | "),
  }));

  if (format === "json") {
    return NextResponse.json(products, {
      headers: { "Content-Disposition": `attachment; filename="catalogo-${id}.json"` },
    });
  }

  if (format === "xlsx") {
    const buffer = await toXlsx(rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="catalogo-${id}.xlsx"`,
      },
    });
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="catalogo-${id}.csv"`,
    },
  });
}
