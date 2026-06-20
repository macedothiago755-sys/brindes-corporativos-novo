import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export const metadata = {
  title: "Política de Cookies | Paint Colors",
  description: "Como a Paint Colors utiliza cookies para melhorar a navegação e personalizar a experiência no site.",
};

export default function CookiesPolicyPage() {
  return (
    <div className="container-premium max-w-3xl py-20">
      <p className="text-sm font-medium text-accent">Política de Cookies</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Política de Cookies Paint Colors</h1>
      <p className="mt-2 text-xs text-muted-foreground">Versão {LEGAL_TERMS_VERSION}</p>

      <p className="mt-6 text-muted-foreground">
        Esta Política de Cookies explica, de forma simples e transparente, o que são cookies, quais utilizamos no
        site da Paint Colors e como você pode gerenciar suas preferências a qualquer momento.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">1. O que são cookies</h2>
        <p className="text-muted-foreground">
          Cookies são pequenos arquivos armazenados no seu navegador quando você visita um site. Eles permitem que o
          site reconheça seu dispositivo, lembre suas preferências e funcione de forma mais eficiente.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">2. Categorias de cookies utilizadas</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Cookies essenciais:</span> necessários para o
            funcionamento básico do site, como login na área administrativa e segurança da navegação. Não podem ser
            desativados.
          </li>
          <li>
            <span className="font-medium text-foreground">Cookies estatísticos:</span> nos ajudam a entender como os
            visitantes utilizam o site (páginas mais acessadas, tempo de navegação), para que possamos melhorar a
            experiência. Só são ativados com seu consentimento.
          </li>
          <li>
            <span className="font-medium text-foreground">Cookies de marketing:</span> utilizados para personalizar
            campanhas e ações de remarketing de acordo com seu interesse em nossos produtos. Só são ativados com seu
            consentimento.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">3. Carregamento condicionado ao consentimento</h2>
        <p className="text-muted-foreground">
          Scripts não essenciais — como ferramentas de Analytics, pixels de redes sociais e remarketing — somente são
          carregados em seu navegador após você autorizar a respectiva categoria de cookies em nosso banner ou no
          painel de preferências. Você pode revisar e alterar suas escolhas a qualquer momento.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">4. Como gerenciar suas preferências</h2>
        <p className="text-muted-foreground">
          Ao visitar o site pela primeira vez, você pode aceitar todos os cookies, recusar os opcionais ou configurar
          suas preferências por categoria. Você também pode limpar os cookies do seu navegador a qualquer momento nas
          configurações do próprio navegador.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">5. Contato</h2>
        <p className="text-muted-foreground">
          Para dúvidas sobre esta Política de Cookies, entre em contato pelo e-mail{" "}
          <a href="mailto:privacidade@paintcolors.com.br" className="font-medium text-foreground underline">
            privacidade@paintcolors.com.br
          </a>
          .
        </p>
      </section>
    </div>
  );
}
