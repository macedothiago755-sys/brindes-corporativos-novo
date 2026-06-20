import { DeletionRequestForm } from "./deletion-request-form";

export const metadata = {
  title: "Solicitar exclusão de dados | Paint Colors",
  description: "Solicite a exclusão dos seus dados pessoais armazenados pela Paint Colors.",
};

export default function DeletionRequestPage() {
  return (
    <div className="container-premium max-w-lg py-20">
      <p className="text-sm font-medium text-accent">Privacidade</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Solicitar exclusão de dados</h1>
      <p className="mt-4 text-muted-foreground">
        Preencha o formulário abaixo para solicitar a exclusão dos seus dados pessoais armazenados pela Paint
        Colors. Nossa equipe analisará o pedido e retornará em até 15 dias úteis.
      </p>

      <div className="mt-8">
        <DeletionRequestForm />
      </div>
    </div>
  );
}
