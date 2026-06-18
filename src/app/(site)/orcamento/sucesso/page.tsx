import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuoteSuccessPage() {
  return (
    <div className="container-premium flex flex-col items-center py-32 text-center">
      <CheckCircle2 className="h-16 w-16 text-accent" />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Orçamento solicitado com sucesso!</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Recebemos sua solicitação. Nossa equipe comercial entrará em contato em breve com uma proposta personalizada.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/produtos">Continuar navegando</Link>
      </Button>
    </div>
  );
}
