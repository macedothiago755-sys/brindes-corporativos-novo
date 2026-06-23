"use client";

import { BookOpen } from "lucide-react";

export default function ConhecimentoPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Base de Conhecimento</h1>
        <p className="text-sm text-slate-500">
          Suba os manuais da sua empresa para que o assistente de IA responda às dúvidas dos seus
          funcionários com segurança.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">Em breve: upload de documentos e assistente de respostas.</p>
      </div>
    </div>
  );
}
