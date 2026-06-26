import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createTestimonial,
  deleteTestimonial,
  createClientLogo,
  deleteClientLogo,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!can(role, "content:edit")) redirect("/admin");

  const [testimonials, clientLogos] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    prisma.clientLogo.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Prova social</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Gerencie depoimentos e logos de empresas exibidos na home.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Depoimentos</h2>
        <div className="mt-4 space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
              <div>
                <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-2 text-xs font-medium">{t.name} · {t.company}</p>
              </div>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="outline" size="sm" className="text-destructive">
                  Excluir
                </Button>
              </form>
            </div>
          ))}
          {testimonials.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum depoimento cadastrado.</p>
          )}
        </div>

        <form action={createTestimonial} className="mt-6 max-w-xl space-y-3 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Novo depoimento</p>
          <Textarea name="quote" placeholder="Depoimento" required />
          <Input name="name" placeholder="Nome do contato" required />
          <Input name="company" placeholder="Empresa" required />
          <Input name="avatar" placeholder="URL do avatar (opcional)" />
          <Button type="submit" size="sm">Adicionar depoimento</Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">Logos de clientes</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {clientLogos.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-3 text-center">
              <p className="text-xs font-medium">{c.name}</p>
              <form action={deleteClientLogo} className="mt-2">
                <input type="hidden" name="id" value={c.id} />
                <Button type="submit" variant="outline" size="sm" className="text-destructive">
                  Excluir
                </Button>
              </form>
            </div>
          ))}
          {clientLogos.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum logo cadastrado.</p>
          )}
        </div>

        <form action={createClientLogo} className="mt-6 max-w-xl space-y-3 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Novo logo</p>
          <Input name="name" placeholder="Nome da empresa" required />
          <Input name="logoUrl" placeholder="URL do logo" required />
          <Button type="submit" size="sm">Adicionar logo</Button>
        </form>
      </section>
    </div>
  );
}
