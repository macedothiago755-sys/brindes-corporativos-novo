import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-muted p-6 lg:flex">
        <p className="text-lg font-semibold">
          BRINDES<span className="text-accent">.</span> Admin
        </p>
        <nav className="mt-8 flex flex-col gap-2 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-background">Dashboard</Link>
          <Link href="/admin/orcamentos" className="rounded-md px-3 py-2 hover:bg-background">Orçamentos</Link>
          <Link href="/admin/produtos" className="rounded-md px-3 py-2 hover:bg-background">Produtos</Link>
          <Link href="/admin/importador" className="rounded-md px-3 py-2 hover:bg-background">Importador</Link>
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="mt-auto"
        >
          <Button variant="outline" size="sm" className="w-full" type="submit">
            Sair
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
