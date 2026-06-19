import Link from "next/link";
import Image from "next/image";
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
      <aside className="hidden w-64 flex-col bg-[#111827] p-6 text-white lg:flex print:hidden">
        <div className="flex items-center gap-2">
          <Image src="/logo-paint-colors.png" alt="Paint Colors Company" width={32} height={32} className="h-8 w-8" />
          <p className="text-lg font-semibold">
            Paint Colors <span className="text-brand-magenta">Admin</span>
          </p>
        </div>
        <div className="mt-6">
          <GlobalSearch />
        </div>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-white/10">Dashboard</Link>
          <Link href="/admin/orcamentos" className="rounded-md px-3 py-2 hover:bg-white/10">Orçamentos</Link>
          <Link href="/admin/produtos" className="rounded-md px-3 py-2 hover:bg-white/10">Produtos</Link>
          {can(role, "kits:edit") && (
            <Link href="/admin/kits" className="rounded-md px-3 py-2 hover:bg-white/10">Kits personalizados</Link>
          )}
          {can(role, "products:view") && (
            <Link href="/admin/analytics" className="rounded-md px-3 py-2 hover:bg-white/10">Analytics</Link>
          )}
          {can(role, "categories:edit") && (
            <Link
              href="/admin/categorias"
              className="ml-3 rounded-md px-3 py-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              ↳ Categorias
            </Link>
          )}
          {can(role, "importer:run") && (
            <Link
              href="/admin/importador"
              className="ml-3 rounded-md px-3 py-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              ↳ Importador de catálogo
            </Link>
          )}
        </nav>
        <div className="mt-auto space-y-3">
          <p className="px-3 text-xs text-white/60">
            {session.user?.name} · {role}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-background p-6 lg:p-10">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
