import Image from "next/image";
import Link from "next/link";
import { Pencil, Copy, Trash2, Power, Plus, Import, HeartPulse } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { SelectionProvider, SelectAllCheckbox, RowCheckbox, BulkActionBar } from "@/components/admin/bulk-selection";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { FeaturedToggle } from "@/components/admin/featured-toggle";
import { deleteProduct, duplicateProduct, toggleProductStatus, bulkUpdateProducts } from "./actions";

export const dynamic = "force-dynamic";

type ProductRow = Awaited<ReturnType<typeof getProducts>>[number];

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  RASCUNHO: "Rascunho",
  INDISPONIVEL: "Indisponível",
};

const STATUS_VARIANTS: Record<string, "success" | "default" | "destructive"> = {
  ATIVO: "success",
  RASCUNHO: "default",
  INDISPONIVEL: "destructive",
};

const SORTABLE_FIELDS: Record<string, true> = {
  name: true,
  sku: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const PAGE_SIZE = 25;

function buildProductsWhere(params: { q?: string; categoryId?: string; status?: string; issue?: string }) {
  const { q, categoryId, status, issue } = params;

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

  return {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
            { supplierCode: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(status ? { status: status as "ATIVO" | "RASCUNHO" | "INDISPONIVEL" } : {}),
    ...issueWhere,
  };
}

function getProducts(params: {
  q?: string;
  categoryId?: string;
  status?: string;
  sort?: string;
  dir?: "asc" | "desc";
  issue?: string;
  page?: number;
}) {
  const { sort, dir, page = 1 } = params;
  const sortField = sort && SORTABLE_FIELDS[sort] ? sort : "createdAt";
  const sortDir = dir === "asc" ? "asc" : "desc";

  return prisma.product.findMany({
    where: buildProductsWhere(params),
    include: { category: true },
    orderBy: { [sortField]: sortDir },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
}

function countProducts(params: { q?: string; categoryId?: string; status?: string; issue?: string }) {
  return prisma.product.count({ where: buildProductsWhere(params) });
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    status?: string;
    sort?: string;
    dir?: string;
    issue?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const dir = params.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(params.page) || 1);

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canEdit = can(role, "products:edit");
  const canDelete = can(role, "products:delete");
  const canImport = can(role, "importer:run");

  const [products, total, categories] = await Promise.all([
    getProducts({ ...params, dir, page }),
    countProducts(params),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  function buildExportQuery() {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    if (params.status) sp.set("status", params.status);
    if (params.issue) sp.set("issue", params.issue);
    return sp.toString();
  }
  const exportQuery = buildExportQuery();

  function buildSortHref(key: string, nextDir: "asc" | "desc") {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    if (params.status) sp.set("status", params.status);
    sp.set("sort", key);
    sp.set("dir", nextDir);
    return `/admin/produtos?${sp.toString()}`;
  }

  function buildPageHref(nextPage: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    if (params.status) sp.set("status", params.status);
    if (params.issue) sp.set("issue", params.issue);
    if (params.sort) sp.set("sort", params.sort);
    if (params.dir) sp.set("dir", params.dir);
    sp.set("page", String(nextPage));
    return `/admin/produtos?${sp.toString()}`;
  }

  const baseColumns: Column<ProductRow>[] = [
    {
      key: "image",
      header: "",
      className: "w-16",
      render: (p) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
          {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized />}
        </div>
      ),
    },
    {
      key: "name",
      header: "Nome",
      sortable: true,
      render: (p) => (
        <div>
          <Link href={`/admin/produtos/${p.id}`} className="font-medium hover:underline">
            {p.name}
          </Link>
          <p className="text-xs text-muted-foreground">{p.category.name}</p>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (p) => p.sku ?? "—",
    },
    {
      key: "supplierCode",
      header: "Código fornecedor",
      render: (p) => p.supplierCode ?? "—",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p) => <Badge variant={STATUS_VARIANTS[p.status]}>{STATUS_LABELS[p.status]}</Badge>,
    },
    {
      key: "featured",
      header: "Destaque",
      className: "text-center",
      render: (p) =>
        canEdit ? (
          <div className="flex justify-center">
            <FeaturedToggle productId={p.id} initialFeatured={p.featured} productName={p.name} />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{p.featured ? "Sim" : "—"}</span>
        ),
    },
    {
      key: "createdAt",
      header: "Criado em",
      sortable: true,
      render: (p) => p.createdAt.toLocaleDateString("pt-BR"),
    },
    {
      key: "updatedAt",
      header: "Atualizado em",
      sortable: true,
      render: (p) => p.updatedAt.toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          {canEdit && (
            <Link href={`/admin/produtos/${p.id}`}>
              <Button variant="outline" size="icon" title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {canEdit && (
            <form action={duplicateProduct}>
              <input type="hidden" name="id" value={p.id} />
              <Button variant="outline" size="icon" title="Duplicar" type="submit">
                <Copy className="h-4 w-4" />
              </Button>
            </form>
          )}
          {canEdit && (
            <form action={toggleProductStatus}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="status" value={p.status} />
              <Button variant="outline" size="icon" title="Ativar/Desativar" type="submit">
                <Power className="h-4 w-4" />
              </Button>
            </form>
          )}
          {canDelete && (
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmSubmitButton
                variant="outline"
                size="icon"
                title="Excluir"
                confirmMessage={`Excluir o produto "${p.name}"? Essa ação não pode ser desfeita.`}
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      ),
    },
  ];

  const columns: Column<ProductRow>[] = canEdit
    ? [
        {
          key: "__select",
          header: <SelectAllCheckbox />,
          className: "w-10",
          render: (p) => <RowCheckbox id={p.id} />,
        },
        ...baseColumns,
      ]
    : baseColumns;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link href="/admin/produtos/saude">
              <Button variant="outline">
                <HeartPulse className="h-4 w-4" /> Saúde do catálogo
              </Button>
            </Link>
          )}
          {canEdit && (
            <>
              <a href={`/api/admin/produtos/export?format=csv&${exportQuery}`}>
                <Button variant="outline">CSV</Button>
              </a>
              <a href={`/api/admin/produtos/export?format=xlsx&${exportQuery}`}>
                <Button variant="outline">Excel</Button>
              </a>
              <Link href={`/admin/produtos/exportar?${exportQuery}`}>
                <Button variant="outline">PDF</Button>
              </Link>
              <Link href="/admin/produtos/catalogo">
                <Button variant="outline">Catálogo comercial</Button>
              </Link>
            </>
          )}
          {canImport && (
            <Link href="/admin/importador">
              <Button variant="outline">
                <Import className="h-4 w-4" /> Importar produtos
              </Button>
            </Link>
          )}
          {canEdit && (
            <Link href="/admin/produtos/novo">
              <Button>
                <Plus className="h-4 w-4" /> Novo produto
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6">
        <TableToolbar
          action="/admin/produtos"
          searchPlaceholder="Buscar por nome, SKU ou código do fornecedor..."
          searchValue={params.q}
          filters={[
            {
              name: "categoryId",
              label: "Todas as categorias",
              value: params.categoryId,
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
            {
              name: "status",
              label: "Todos os status",
              value: params.status,
              options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </div>

      <div className="mt-6">
        {canEdit ? (
          <SelectionProvider ids={products.map((p) => p.id)}>
            <BulkActionBar categories={categories} bulkUpdateAction={bulkUpdateProducts} />
            <DataTable
              columns={columns}
              rows={products}
              getRowId={(p) => p.id}
              sort={params.sort}
              dir={dir}
              buildSortHref={buildSortHref}
              emptyState="Nenhum produto encontrado."
            />
          </SelectionProvider>
        ) : (
          <DataTable
            columns={columns}
            rows={products}
            getRowId={(p) => p.id}
            sort={params.sort}
            dir={dir}
            buildSortHref={buildSortHref}
            emptyState="Nenhum produto encontrado."
          />
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildPageHref} />
      </div>
    </div>
  );
}
