import Link from "next/link";
import { BookOpen, Briefcase, Sparkles } from "lucide-react";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard/vagas"
            data-tour="dashboard-overview"
            className="flex items-center gap-2 font-semibold text-slate-900"
          >
            <Sparkles className="h-5 w-5 text-indigo-600" />
            RH IA
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/dashboard/vagas"
              data-tour="nav-vagas"
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600"
            >
              <Briefcase className="h-4 w-4" />
              Vagas
            </Link>
            <Link
              href="/dashboard/conhecimento"
              data-tour="nav-knowledge"
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600"
            >
              <BookOpen className="h-4 w-4" />
              Base de Conhecimento
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      <WelcomeTour />
    </div>
  );
}
