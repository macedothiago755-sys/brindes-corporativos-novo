import Link from "next/link";
import { Briefcase, Sparkles } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard/vagas" className="flex items-center gap-2 font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            RH IA
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/dashboard/vagas"
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600"
            >
              <Briefcase className="h-4 w-4" />
              Vagas
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
