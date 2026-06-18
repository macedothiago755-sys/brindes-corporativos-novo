import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const statusOptions = ["NOVO", "EM_ANALISE", "RESPONDIDO", "FECHADO", "PERDIDO"] as const;
const statusLabels: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  RESPONDIDO: "Respondido",
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

  const item = quote.items[0];

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
        <div><p className="text-xs text-muted-foreground">Produto</p><p className="font-medium">{item?.product.name}</p></div>
        <div><p className="text-xs text-muted-foreground">Quantidade</p><p className="font-medium">{item?.quantidade}</p></div>
        <div><p className="text-xs text-muted-foreground">Cores</p><p className="font-medium">{item?.cores.join(", ")}</p></div>
        <div><p className="text-xs text-muted-foreground">Personalização</p><p className="font-medium">{item?.personalizacao.join(", ")}</p></div>
      </div>

      {quote.attachments.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold">Arquivo enviado</p>
          <a href={quote.attachments[0].url} target="_blank" className="text-sm text-accent underline">
            {quote.attachments[0].filename}
          </a>
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
