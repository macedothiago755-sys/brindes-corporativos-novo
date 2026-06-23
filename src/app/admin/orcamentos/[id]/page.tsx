import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site-config";
import { QuoteItemsPricing } from "@/components/admin/quote-items-pricing";

export const dynamic = "force-dynamic";

const statusOptions = ["NOVO", "EM_ANALISE", "RESPONDIDO", "APROVADO", "AJUSTE_SOLICITADO", "FECHADO", "PERDIDO"] as const;
const statusLabels: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  RESPONDIDO: "Respondido",
  APROVADO: "Aprovado",
  AJUSTE_SOLICITADO: "Ajuste solicitado",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
};

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, attachments: true },
  });

  if (!quote) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    await prisma.quote.update({ where: { id }, data: { status: status as never } });
    revalidatePath(`/admin/orcamentos/${id}`);
    revalidatePath("/admin/orcamentos");
  }

  async function addObservation(formData: FormData) {
    "use server";
    const observacoes = formData.get("observacoes") as string;
    await prisma.quote.update({ where: { id }, data: { observacoes } });
    revalidatePath(`/admin/orcamentos/${id}`);
  }

  const pricingItems = quote.items.map((it) => ({
    id: it.id,
    productName: it.product.name,
    quantidade: it.quantidade,
    precoUnitario: it.precoUnitario,
    cores: it.cores,
    personalizacao: it.personalizacao,
  }));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orçamento de {quote.clienteNome}</h1>
        <Badge variant="accent">{statusLabels[quote.status]}</Badge>
      </div>

      <div className="mt-8 grid gap-4 rounded-xl border border-border p-6 sm:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">Empresa</p><p className="font-medium">{quote.empresa}</p></div>
        <div><p className="text-xs text-muted-foreground">E-mail</p><p className="font-medium">{quote.email}</p></div>
        <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{quote.telefone}</p></div>
        <div><p className="text-xs text-muted-foreground">Cidade</p><p className="font-medium">{quote.cidade || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Itens</p><p className="font-medium">{quote.items.length} produto(s)</p></div>
        <div><p className="text-xs text-muted-foreground">Cupom</p><p className="font-medium">{quote.couponCode || "—"}</p></div>
        <div>
          <p className="text-xs text-muted-foreground">Visualização da proposta</p>
          <p className="font-medium">
            {quote.viewCount === 0
              ? "Não visualizado"
              : `Visualizado ${quote.viewCount}x - Última em ${quote.lastViewedAt?.toLocaleDateString("pt-BR")}`}
          </p>
        </div>
      </div>

      {pricingItems.length > 0 && <QuoteItemsPricing quoteId={quote.id} items={pricingItems} />}

      {quote.approvalToken && (
        <p className="mt-6 text-sm text-muted-foreground">
          Link de aprovação para enviar ao cliente:{" "}
          <a
            href={`${SITE_URL}/orcamento/aprovar/${quote.approvalToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {SITE_URL}/orcamento/aprovar/{quote.approvalToken}
          </a>
        </p>
      )}

      {quote.feedbackNotes && (
        <div className="mt-6 rounded-xl border border-border p-6">
          <p className="text-sm font-semibold">Ajuste solicitado pelo cliente</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{quote.feedbackNotes}</p>
        </div>
      )}

      {quote.attachments.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold">Arquivos e mockups enviados</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {quote.attachments.map((att) => {
              const isImage = /\.(png|jpe?g|svg|webp|avif)(\?|$)/i.test(att.url);
              const isMockup = att.filename.startsWith("mockup-") || att.filename.startsWith("logo-");
              return (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-32 flex-col gap-2 rounded-lg border border-border p-2 transition-colors hover:border-accent"
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={att.url} alt={att.filename} className="h-28 w-full rounded object-contain" />
                  ) : (
                    <span className="flex h-28 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      Arquivo
                    </span>
                  )}
                  <span className="truncate text-xs text-accent group-hover:underline" title={att.filename}>
                    {isMockup ? "🎨 " : ""}
                    {att.filename}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <p className="text-sm font-semibold">Alterar status</p>
        <form action={updateStatus} className="mt-3 flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <Button key={s} type="submit" name="status" value={s} variant={s === quote.status ? "default" : "outline"} size="sm">
              {statusLabels[s]}
            </Button>
          ))}
        </form>
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold">Observações</p>
        <form action={addObservation} className="mt-3 space-y-3">
          <Textarea name="observacoes" defaultValue={quote.observacoes ?? ""} />
          <Button type="submit" size="sm">Salvar observação</Button>
        </form>
      </div>
    </div>
  );
}
