import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { LeadRowActions } from "./lead-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !can(role, "customers:edit")) {
    redirect("/admin");
  }

  const [leads, cookieConsents] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.cookieConsent.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Privacidade</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads cadastrados, consentimentos LGPD e preferências de cookies registradas pelos visitantes.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download de arquivo, não navegação */}
        <a href="/api/leads/export" className="text-sm text-accent underline">
          Exportar leads (CSV)
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Leads e consentimento</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Cupom</th>
                <th className="px-4 py-3">Consentimento</th>
                <th className="px-4 py-3">Versão</th>
                <th className="px-4 py-3">Data do aceite</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{lead.email}</td>
                  <td className="px-4 py-3">{lead.telefone}</td>
                  <td className="px-4 py-3">
                    {lead.couponCode ? <Badge variant="outline">{lead.couponCode}</Badge> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={lead.consentAceito ? "accent" : "outline"}>
                      {lead.consentAceito ? "Aceito" : "Não aceito"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.consentVersion || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.consentDate ? lead.consentDate.toLocaleString("pt-BR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <LeadRowActions leadId={lead.id} />
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum lead cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Preferências de cookies recentes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Últimos registros de consentimento de cookies, identificados por sessão (IP armazenado de forma anonimizada).
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">Sessão</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Categorias aceitas</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {cookieConsents.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.sessionId.slice(0, 12)}…</td>
                  <td className="px-4 py-3">{c.consentStatus}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {c.acceptedCategories.map((cat) => (
                        <Badge key={cat} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.createdAt.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
              {cookieConsents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum registro de cookies ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
