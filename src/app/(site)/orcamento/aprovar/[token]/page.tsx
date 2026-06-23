import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  notifyQuoteApproved,
  notifyQuoteAdjustmentRequested,
} from "@/shared/services/email.service";

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

export default async function QuoteApprovalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await prisma.quote.findUnique({
    where: { approvalToken: token },
    include: { items: { include: { product: true } } },
  });

  if (!quote) notFound();

  // Apenas visitas de clientes (não logados no admin) contam como visualização
  // da proposta. Roda após a resposta inicial para nunca atrasar o carregamento.
  const session = await auth();
  if (!session) {
    after(() =>
      prisma.$transaction([
        prisma.quote.update({
          where: { id: quote.id },
          data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
        }),
        prisma.auditLog.create({
          data: { action: "VIEW", targetType: "Quote", targetId: quote.id },
        }),
      ]).catch(() => {})
    );
  }

  const item = quote.items[0];
  const decided = quote.status === "APROVADO" || quote.status === "AJUSTE_SOLICITADO";
  const quoteId = quote.id;
  const clienteNome = quote.clienteNome;
  const empresa = quote.empresa;
  const email = quote.email;

  async function approve() {
    "use server";
    await prisma.quote.update({ where: { id: quoteId }, data: { status: "APROVADO" } });
    revalidatePath(`/orcamento/aprovar/${token}`);
    after(() => notifyQuoteApproved({ quoteId, clienteNome, empresa, email }));
  }

  async function requestAdjustment(formData: FormData) {
    "use server";
    const feedbackNotes = String(formData.get("feedbackNotes") ?? "").slice(0, 2000);
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: "AJUSTE_SOLICITADO", feedbackNotes },
    });
    revalidatePath(`/orcamento/aprovar/${token}`);
    after(() => notifyQuoteAdjustmentRequested({ quoteId, clienteNome, empresa, email, feedbackNotes }));
  }

  return (
    <div className="container-premium max-w-2xl py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sua proposta, {quote.clienteNome}</h1>
        <Badge variant="accent">{statusLabels[quote.status]}</Badge>
      </div>

      <div className="mt-8 grid gap-4 rounded-xl border border-border p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Produto</p>
          <p className="font-medium">{item?.product.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Quantidade</p>
          <p className="font-medium">{item?.quantidade}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Cores</p>
          <p className="font-medium">{item?.cores.join(", ") || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Personalização</p>
          <p className="font-medium">{item?.personalizacao.join(", ") || "—"}</p>
        </div>
      </div>

      {decided ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {quote.status === "APROVADO"
            ? "Você já aprovou esta proposta. Nosso time comercial entrará em contato em breve."
            : "Recebemos seu pedido de ajuste. Nosso time comercial vai revisar e retornar em breve."}
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <form action={approve}>
            <Button type="submit" className="w-full sm:w-auto">
              Aprovar Proposta
            </Button>
          </form>

          <form action={requestAdjustment} className="space-y-3">
            <p className="text-sm font-semibold">Ou solicite um ajuste</p>
            <Textarea name="feedbackNotes" placeholder="Descreva o que gostaria de ajustar na proposta…" rows={4} />
            <Button type="submit" variant="outline">
              Solicitar Ajuste
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
