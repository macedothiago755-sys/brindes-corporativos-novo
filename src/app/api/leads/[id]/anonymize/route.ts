import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "customers:edit")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const anonymized = await prisma.lead.update({
    where: { id },
    data: {
      nome: null,
      empresa: null,
      email: `anonimizado-${id}@paintcolors.invalid`,
      telefone: "ANONIMIZADO",
      anonymizedAt: new Date(),
    },
  });
  await logAudit(userId ?? null, "ANONYMIZE", "Lead", id);

  return NextResponse.json({ ok: true, lead: anonymized });
}
