import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "customers:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const header = "Email,Telefone,Cupom,Consentimento,VersaoTermos,DataConsentimento,DataCadastro\n";
  const rows = leads
    .map((l) =>
      [
        l.email,
        l.telefone,
        l.couponCode ?? "",
        l.consentAceito ? "Sim" : "Não",
        l.consentVersion ?? "",
        l.consentDate?.toISOString() ?? "",
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
