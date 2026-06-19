import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { GlobalSearch } from "@/components/admin/global-search";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  const role = (session.user as { role?: string } | undefined)?.role;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-muted p-6 lg:flex print:hidden">
        <p className="text-lg font-semibold">
          BRINDES<span className="text-accent">.</span> Admin
        </p>
        <div className="mt-6">
          <GlobalSearch />
        </div>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-background">Dashboard</Link>
          <Link href="/admin/orcamentos" className="rounded-md px-3 py-2 hover:bg-background">Orçamentos</Link>
          <Link href="/admin/produtos" className="rounded-md px-3 py-2 hover:bg-background">Produtos</Link>
          {can(role, "categories:edit") && (
            <Link
              href="/admin/categorias"
              className="ml-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              ↳ Categorias
            </Link>
          )}
          {can(role, "importer:run") && (
            <Link
              href="/admin/importador"
              className="ml-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              ↳ Importador de catálogo
            </Link>
          )}
        </nav>
        <div className="mt-auto space-y-3">
          <p className="px-3 text-xs text-muted-foreground">
            {session.user?.name} · {role}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button variant="outline" size="sm" className="w-full" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
