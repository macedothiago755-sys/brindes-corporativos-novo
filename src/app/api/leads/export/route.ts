import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "customers:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  await logAudit(userId ?? null, "EXPORT", "Lead");

  const header = "Nome,Empresa,Email,Telefone,Cupom,ConsentimentoObrigatorio,ConsentimentoMarketing,VersaoTermos,DataConsentimento,DataCadastro\n";
  const rows = leads
    .map((l) =>
      [
        l.nome ?? "",
        l.empresa ?? "",
        l.email,
        l.telefone,
        l.couponCode ?? "",
        l.consentObrigatorioAceito ? "Sim" : "Não",
        l.consentMarketingAceito ? "Sim" : "Não",
        l.consentObrigatorioVersion ?? "",
        l.consentObrigatorioDate?.toISOString() ?? "",
        l.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads.csv",
    },
  });
}
