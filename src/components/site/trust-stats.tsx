import { Clock, ShieldCheck, Truck } from "lucide-react";

/**
 * Barra de confiança no topo. Em vez de métricas fabricadas (nº de empresas/
 * projetos), exibe promessas operacionais verificáveis — que também funcionam
 * como gatilhos de redução de risco para o comprador B2B.
 * Para exibir números reais, troque por dados auditáveis da operação.
 */
const trustItems = [
  { icon: Clock, label: "Proposta em até 1 hora útil" },
  { icon: ShieldCheck, label: "Aprovação da arte antes de produzir" },
  { icon: Truck, label: "Entrega para todo o Brasil" },
];

export function TrustStats() {
  return (
    <section className="border-b border-border bg-background py-3.5">
      <div className="container-premium flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-center text-xs sm:text-sm">
        {trustItems.map((item) => (
          <span key={item.label} className="flex items-center gap-2 text-muted-foreground">
            <item.icon className="h-4 w-4 text-accent" aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
