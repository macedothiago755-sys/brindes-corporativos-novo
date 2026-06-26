import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CACHE_TAGS } from "@/lib/cached-queries";
import { productImportRowSchema } from "@/lib/validations";
import { parseObjective, parseProfile, parsePriceTier, parseStatus } from "@/lib/catalog-spreadsheet";

// ExcelJS depende de APIs do Node (Buffer/streams) — força o runtime Node em
// vez de Edge. Dá folga de tempo para planilhas grandes serem processadas.
export const runtime = "nodejs";
export const maxDuration = 60;

// Acima do limite de corpo da Vercel (~4,5 MB) a plataforma rejeita antes de
// chegar aqui; barramos um pouco antes para devolver JSON legível ao cliente.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

// Cabeçalhos aceitos na planilha → chave interna. Tolerante a acento/caixa.
const HEADER_MAP: Record<string, string> = {
  id: "id",
  nome: "name",
  sku: "sku",
  "codigo do fornecedor": "supplierCode",
  "codigo fornecedor": "supplierCode",
  categoria: "categoryName",
  subcategoria: "subcategoryName",
  marca: "brand",
  status: "status",
  preco: "price",
  "quantidade minima": "minQty",
  cor: "colors",
  cores: "colors",
  material: "materials",
  materiais: "materials",
  tags: "tags",
  "meta titulo": "metaTitle",
  "meta descricao": "metaDescription",
  "objetivos compativeis": "objectives",
  perfil: "profile",
  "faixa de preco": "priceTier",
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function splitList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

type RawRow = Record<string, string>;

// Parser de CSV simples com suporte a aspas duplas e vírgulas dentro de campos.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

async function readRows(file: File): Promise<RawRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  let matrix: string[][];

  if (file.name.toLowerCase().endsWith(".csv")) {
    matrix = parseCsv(Buffer.from(arrayBuffer).toString("utf-8"));
  } else {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];
    matrix = [];
    sheet.eachRow((row) => {
      const values: string[] = [];
      // row.values é 1-indexado (índice 0 é vazio).
      const arr = row.values as unknown[];
      for (let i = 1; i < arr.length; i++) {
        const v = arr[i];
        values.push(v == null ? "" : String(typeof v === "object" && "text" in (v as object) ? (v as { text: string }).text : v));
      }
      matrix.push(values);
    });
  }

  if (matrix.length < 2) return [];

  const headers = matrix[0].map((h) => HEADER_MAP[normalizeHeader(h)] ?? "");
  return matrix.slice(1).map((cells) => {
    const obj: RawRow = {};
    headers.forEach((key, i) => {
      if (key) obj[key] = (cells[i] ?? "").toString();
    });
    return obj;
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "products:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { error: `Arquivo muito grande (${mb} MB). O limite é 4 MB. Divida a planilha em lotes menores ou remova imagens embutidas.` },
      { status: 413 }
    );
  }

  let rawRows: RawRow[];
  try {
    rawRows = await readRows(file);
  } catch {
    return NextResponse.json({ error: "Não foi possível ler a planilha. Verifique o formato (CSV ou XLSX)." }, { status: 400 });
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ error: "A planilha está vazia ou sem cabeçalho válido." }, { status: 400 });
  }

  try {
  // Cache de categorias para resolver "Categoria" (nível pai) e, opcionalmente,
  // "Subcategoria" (filha daquela categoria) → categoryId efetivo do produto.
  const categories = await prisma.category.findMany({ select: { id: true, name: true, parentId: true } });
  const topCategoryByName = new Map(
    categories.filter((c) => !c.parentId).map((c) => [normalizeHeader(c.name), c.id])
  );
  const subcategoryByParentAndName = new Map(
    categories.filter((c) => c.parentId).map((c) => [`${c.parentId}::${normalizeHeader(c.name)}`, c.id])
  );

  const errors: string[] = [];
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const lineNo = i + 2; // +2: linha 1 é cabeçalho, índice começa em 0

    // Traduz rótulos legíveis de volta para os códigos dos enums.
    const objectives = splitList(raw.objectives ?? "")
      .map((v) => parseObjective(v))
      .filter((v): v is string => Boolean(v));

    const parsed = productImportRowSchema.safeParse({
      id: raw.id,
      name: raw.name,
      sku: raw.sku,
      supplierCode: raw.supplierCode,
      brand: raw.brand,
      status: raw.status ? parseStatus(raw.status) : undefined,
      categoryName: raw.categoryName,
      subcategoryName: raw.subcategoryName,
      price: raw.price ?? "",
      minQty: raw.minQty || undefined,
      colors: raw.colors ?? "",
      materials: raw.materials ?? "",
      tags: raw.tags ?? "",
      metaTitle: raw.metaTitle,
      metaDescription: raw.metaDescription,
      objectives,
      profile: raw.profile ? parseProfile(raw.profile) : undefined,
      priceTier: raw.priceTier ? parsePriceTier(raw.priceTier) : undefined,
    });

    if (!parsed.success) {
      errors.push(`Linha ${lineNo}: ${parsed.error.issues[0]?.message ?? "dados inválidos"}.`);
      skipped++;
      continue;
    }

    const data = parsed.data;

    // Localiza o produto existente por ID e, em fallback, por SKU.
    const existing = data.id
      ? await prisma.product.findUnique({ where: { id: data.id }, select: { id: true } })
      : data.sku
      ? await prisma.product.findUnique({ where: { sku: data.sku }, select: { id: true } })
      : null;

    if (!existing) {
      errors.push(`Linha ${lineNo}: produto não encontrado (ID/SKU). Linha ignorada.`);
      skipped++;
      continue;
    }

    // Resolve a categoria-pai pelo nome e, se houver "Subcategoria" na planilha,
    // troca o categoryId efetivo pela subcategoria (desde que filha daquela
    // categoria). Subcategoria vazia é válida — produto fica só na categoria pai.
    const parentCategoryId = data.categoryName ? topCategoryByName.get(normalizeHeader(data.categoryName)) : undefined;
    if (data.categoryName && !parentCategoryId) {
      errors.push(`Linha ${lineNo}: categoria "${data.categoryName}" não encontrada. Categoria não alterada.`);
    }

    let categoryId = parentCategoryId;
    if (parentCategoryId && data.subcategoryName) {
      const subcategoryId = subcategoryByParentAndName.get(`${parentCategoryId}::${normalizeHeader(data.subcategoryName)}`);
      if (subcategoryId) {
        categoryId = subcategoryId;
      } else {
        errors.push(
          `Linha ${lineNo}: subcategoria "${data.subcategoryName}" não encontrada em "${data.categoryName}". Produto mantido apenas na categoria.`
        );
      }
    }

    // Protege cada linha: um erro de banco (ex.: SKU duplicado) vira erro
    // reportado e segue para a próxima, em vez de derrubar toda a importação.
    try {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          ...(data.sku !== undefined ? { sku: data.sku } : {}),
          ...(data.supplierCode !== undefined ? { supplierCode: data.supplierCode } : {}),
          ...(data.brand !== undefined ? { brand: data.brand } : {}),
          ...(data.status ? { status: data.status } : {}),
          ...(categoryId ? { categoryId } : {}),
          price: data.price ?? null,
          ...(data.minQty ? { minQty: data.minQty } : {}),
          colors: data.colors,
          materials: data.materials,
          tags: data.tags,
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
          objectives: data.objectives,
          profile: data.profile ?? null,
          priceTier: data.priceTier ?? null,
        },
      });
      updated++;
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "P2002") {
        const target = (e as { meta?: { target?: string[] } }).meta?.target?.join(", ") ?? "campo único";
        errors.push(`Linha ${lineNo}: valor duplicado em ${target} (já usado por outro produto). Linha ignorada.`);
      } else {
        const msg = e instanceof Error ? e.message : "erro desconhecido";
        errors.push(`Linha ${lineNo}: falha ao salvar (${msg}). Linha ignorada.`);
      }
      skipped++;
    }
  }

  revalidatePath("/admin/produtos");
  revalidateTag(CACHE_TAGS.products, "max");

  return NextResponse.json({ updated, skipped, errors });
  } catch (e) {
    // Erro inesperado durante o processamento: reporta ao Sentry e devolve
    // JSON com a causa real, em vez de um 500 opaco.
    Sentry.captureException(e);
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    return NextResponse.json(
      { error: `Falha ao processar a planilha: ${msg}` },
      { status: 500 }
    );
  }
}
