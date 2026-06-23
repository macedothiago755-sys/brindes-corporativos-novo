import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  RESPONDIDO: "Respondido",
  APROVADO: "Aprovado",
  AJUSTE_SOLICITADO: "Ajuste solicitado",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
};

export default async function AdminQuotesPage() {
  const quotes = await prisma.quote.findMany({
    include: { items: { include: { product: true } }, attachments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orçamentos</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download de arquivo, não navegação */}
        <a href="/api/quotes/export" className="text-sm text-accent underline">
          Exportar dados
        </a>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Qtd.</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cupom</th>
              <th className="px-4 py-3">Visualização</th>
              <th className="px-4 py-3">Arquivo</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orcamentos/${q.id}`} className="font-medium hover:underline">
                    {q.clienteNome}
                  </Link>
                  <p className="text-xs text-muted-foreground">{q.empresa}</p>
                </td>
                <td className="px-4 py-3">{q.items[0]?.product.name}</td>
                <td className="px-4 py-3">{q.items[0]?.quantidade}</td>
                <td className="px-4 py-3">{q.createdAt.toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <Badge variant={q.status === "NOVO" ? "accent" : "outline"}>{statusLabels[q.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  {q.couponCode ? <Badge variant="outline">{q.couponCode}</Badge> : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3">
                  {q.viewCount === 0 ? (
                    <Badge variant="outline">Não visualizado</Badge>
                  ) : (
                    <Badge variant="accent">
                      Visualizado {q.viewCount}x{q.lastViewedAt ? ` - Última em ${q.lastViewedAt.toLocaleDateString("pt-BR")}` : ""}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {q.attachments[0] ? (
                    <a href={q.attachments[0].url} target="_blank" className="text-accent underline">
                      Ver arquivo
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
