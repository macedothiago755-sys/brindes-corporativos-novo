import Link from "next/link";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export const metadata = {
  title: "Termos de Uso | Paint Colors",
  description: "Condições de uso do site e dos serviços da Paint Colors.",
};

export default function TermsOfUsePage() {
  return (
    <div className="container-premium max-w-3xl py-20">
      <p className="text-sm font-medium text-accent">Termos de Uso</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Termos de Uso Paint Colors</h1>
      <p className="mt-2 text-xs text-muted-foreground">Versão {LEGAL_TERMS_VERSION}</p>

      <p className="mt-6 text-muted-foreground">
        Estes Termos de Uso regulam a navegação e a utilização do site e dos serviços da Paint Colors. Ao solicitar
        um orçamento, cadastrar seus dados ou utilizar qualquer funcionalidade do site, você concorda com as
        condições abaixo.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">1. Uso do site</h2>
        <p className="text-muted-foreground">
          O site da Paint Colors destina-se à apresentação do catálogo de brindes corporativos personalizados e à
          solicitação de orçamentos. As informações fornecidas pelos usuários devem ser verdadeiras, atuais e
          precisas, sendo de responsabilidade do usuário a exatidão dos dados informados.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">2. Orçamentos e propostas</h2>
        <p className="text-muted-foreground">
          As solicitações de orçamento realizadas através do site não constituem compra ou compromisso financeiro
          automático. Valores, prazos e condições comerciais são confirmados diretamente por nossa equipe comercial
          após a análise da solicitação.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">3. Propriedade intelectual</h2>
        <p className="text-muted-foreground">
          Todo o conteúdo disponível no site — textos, imagens, marca e identidade visual — é de propriedade da
          Paint Colors ou utilizado sob licença, sendo proibida sua reprodução sem autorização prévia.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">4. Tratamento de dados pessoais</h2>
        <p className="text-muted-foreground">
          O tratamento de dados pessoais coletados através do site segue as condições descritas em nosso{" "}
          <Link href="/politica-de-privacidade" className="font-medium text-foreground underline">
            Aviso de Privacidade
          </Link>
          , parte integrante destes Termos de Uso.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">5. Alterações destes termos</h2>
        <p className="text-muted-foreground">
          A Paint Colors pode atualizar estes Termos de Uso periodicamente para refletir melhorias no site ou
          mudanças legais. A versão vigente estará sempre disponível nesta página.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">6. Contato</h2>
        <p className="text-muted-foreground">
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail{" "}
          <a href="mailto:privacidade@paintcolors.com.br" className="font-medium text-foreground underline">
            privacidade@paintcolors.com.br
          </a>
          .
        </p>
      </section>
    </div>
  );
}
