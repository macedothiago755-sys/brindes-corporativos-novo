"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const DEFAULT_PHRASES = [
  "Claude está estruturando a vaga...",
  "Analisando competências no mercado...",
  "Definindo requisitos e responsabilidades...",
  "Elaborando perguntas de triagem...",
];

export function AiLoader({ phrases = DEFAULT_PHRASES }: { phrases?: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="animate-pulse text-sm font-medium text-slate-600">{phrases[index]}</p>
      <div className="w-full space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
