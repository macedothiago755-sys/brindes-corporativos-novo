import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";

async function getFilteredProducts(searchParams: URLSearchParams) {
  const q = searchParams.get("q") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const status = searchParams.get("status") || undefined;
  const issue = searchParams.get("issue") || undefined;

  const issueWhere =
    issue === "sem-imagem"
      ? { images: { isEmpty: true } }
      : issue === "sem-descricao"
      ? { shortDescription: null }
      : issue === "sem-sku"
      ? { sku: null }
      : issue === "poucas-informacoes"
      ? { benefits: { isEmpty: true }, features: { isEmpty: true } }
      : {};

  return prisma.product.findMany({
    where: {
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status: status as "ATIVO" | "RASCUNHO" | "INDISPONIVEL" } : {}),
      ...issueWhere,
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function GET(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "products:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const products = await getFilteredProducts(searchParams);

  const columns = ["Nome", "SKU", "Categoria", "Marca", "Status", "Preço", "Quantidade mínima", "Tags"];
  const rows = products.map((p) => [
    p.name,
    p.sku ?? "",
    p.category.name,
    p.brand ?? "",
    p.status,
    p.price ?? "",
    p.minQty,
    p.tags.join(", "),
  ]);

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Produtos");
    sheet.addRow(columns);
    rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=produtos.xlsx",
      },
    });
  }

  const csv = [columns, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=produtos.csv",
    },
  });
}
