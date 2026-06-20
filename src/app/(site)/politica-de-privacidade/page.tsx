import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export const metadata = {
  title: "Aviso de Privacidade | Paint Colors",
  description: "Como a Paint Colors coleta, usa e protege os dados pessoais de clientes e visitantes.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-premium max-w-3xl py-20">
      <p className="text-sm font-medium text-accent">Aviso de Privacidade</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Aviso de Privacidade Paint Colors</h1>
      <p className="mt-2 text-xs text-muted-foreground">Versão {LEGAL_TERMS_VERSION}</p>

      <p className="mt-6 text-muted-foreground">
        Na Paint Colors, valorizamos a privacidade de cada empresa e profissional que confia em nós para criar
        experiências memoráveis com brindes corporativos personalizados. Este Aviso de Privacidade explica, de forma
        clara e transparente, quais dados coletamos, como os utilizamos e quais direitos você tem sobre eles, em
        conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">1. Quais dados coletamos</h2>
        <p className="text-muted-foreground">
          Para viabilizar orçamentos, atendimento comercial e a melhoria contínua da sua experiência em nosso site,
          podemos coletar as seguintes categorias de dados:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Dados cadastrais:</span> nome, empresa, CNPJ, e-mail,
            telefone e endereço.
          </li>
          <li>
            <span className="font-medium text-foreground">Dados comerciais:</span> produtos de interesse, histórico
            de orçamentos solicitados e preferências de compra.
          </li>
          <li>
            <span className="font-medium text-foreground">Dados técnicos:</span> endereço IP, navegador, dispositivo
            utilizado, cookies e demais dados de navegação no site.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">2. Como usamos os dados</h2>
        <p className="text-muted-foreground">Os dados coletados são utilizados exclusivamente para:</p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Processar e responder solicitações de orçamento;</li>
          <li>Realizar contato comercial relacionado aos produtos e serviços da Paint Colors;</li>
          <li>Melhorar a experiência de navegação no site;</li>
          <li>Personalizar recomendações de kits e produtos de acordo com seu perfil;</li>
          <li>Enviar comunicações previamente autorizadas, como ofertas e novidades;</li>
          <li>Aprimorar continuamente nossos produtos e serviços.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">3. Compartilhamento de dados</h2>
        <p className="text-muted-foreground">
          A Paint Colors não vende dados pessoais. O compartilhamento de informações ocorre apenas quando necessário
          para a operação do nosso serviço, como no processamento de pedidos e orçamentos, no uso de ferramentas de
          comunicação (e-mail e WhatsApp, por exemplo) e em serviços técnicos de hospedagem e infraestrutura que nos
          auxiliam a manter o site funcionando com segurança.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">4. Segurança</h2>
        <p className="text-muted-foreground">
          Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo controle de acesso,
          proteção contra acessos não autorizados, boas práticas de armazenamento e restrição do acesso interno às
          informações apenas a colaboradores que precisam delas para exercer suas funções.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">5. Direitos do titular (LGPD)</h2>
        <p className="text-muted-foreground">Como titular dos dados, você tem direito a:</p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Confirmação da existência de tratamento dos seus dados;</li>
          <li>Acesso aos dados armazenados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Portabilidade dos dados a outro fornecedor de serviço, mediante solicitação expressa;</li>
          <li>Eliminação dos dados, quando aplicável;</li>
          <li>Revogação do consentimento previamente concedido;</li>
          <li>Informação clara sobre o uso que é feito dos seus dados.</li>
        </ul>
        <p className="text-muted-foreground">
          Você pode solicitar qualquer um desses direitos a qualquer momento pelo e-mail indicado na seção
          &quot;Contato&quot; abaixo. Suas solicitações são registradas e acompanhadas até a conclusão.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">6. Retenção de dados</h2>
        <p className="text-muted-foreground">
          Mantemos seus dados apenas pelo tempo necessário para as finalidades descritas neste Aviso:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Leads que não avançam para um relacionamento comercial são mantidos por até 12 meses, após os quais são eliminados ou anonimizados;</li>
          <li>Dados de clientes são mantidos durante toda a vigência do relacionamento comercial;</li>
          <li>Dados cuja retenção seja exigida por lei (fiscal, contábil ou regulatória) são mantidos pelo prazo legal aplicável.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">7. Contato</h2>
        <p className="text-muted-foreground">
          Para exercer seus direitos ou esclarecer dúvidas sobre este Aviso de Privacidade, entre em contato pelo
          e-mail{" "}
          <a href="mailto:privacidade@paintcolors.com.br" className="font-medium text-foreground underline">
            privacidade@paintcolors.com.br
          </a>
          . Você também pode{" "}
          <a href="/privacidade/solicitar-exclusao" className="font-medium text-foreground underline">
            solicitar a exclusão dos seus dados
          </a>{" "}
          diretamente pelo nosso formulário.
        </p>
      </section>
    </div>
  );
}
