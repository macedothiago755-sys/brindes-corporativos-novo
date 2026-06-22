import { SITE_URL, SITE_NAME } from "@/lib/site-config";

/**
 * Notificação de novo lead para o time comercial. Dois canais, ambos opcionais
 * e ativados só quando as variáveis de ambiente estão preenchidas:
 *
 *  - E-mail transacional via Resend (RESEND_API_KEY + NOTIFY_EMAIL_TO).
 *  - Webhook genérico (LEAD_NOTIFICATION_WEBHOOK_URL) compatível com Slack,
 *    Discord, n8n, Zapier, etc.
 *
 * Tudo via fetch nativo (sem dependência nova) e à prova de falha: qualquer erro
 * é engolido para nunca quebrar o envio do orçamento do cliente. Chame sempre
 * dentro de after() para não bloquear a resposta.
 */

export type QuoteNotification = {
  tipo: string;
  clienteNome: string;
  empresa: string;
  email: string;
  telefone: string;
  cidade?: string | null;
  resumo: string;
  quoteId: string;
};

const adminUrl = `${SITE_URL}/admin/orcamentos`;

function buildText(n: QuoteNotification) {
  return [
    `🔔 Novo ${n.tipo} no site`,
    "",
    `• Cliente: ${n.clienteNome}`,
    `• Empresa: ${n.empresa}`,
    `• E-mail: ${n.email}`,
    `• Telefone: ${n.telefone}`,
    ...(n.cidade ? [`• Cidade: ${n.cidade}`] : []),
    `• Detalhes: ${n.resumo}`,
    "",
    `Abrir no painel: ${adminUrl}`,
  ].join("\n");
}

function buildHtml(n: QuoteNotification) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#5f6368">${label}</td><td style="padding:4px 0;font-weight:600">${value}</td></tr>`;
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
      <h2 style="margin:0 0 12px">🔔 Novo ${n.tipo} no site</h2>
      <table style="border-collapse:collapse;font-size:14px">
        ${row("Cliente", n.clienteNome)}
        ${row("Empresa", n.empresa)}
        ${row("E-mail", n.email)}
        ${row("Telefone", n.telefone)}
        ${n.cidade ? row("Cidade", n.cidade) : ""}
        ${row("Detalhes", n.resumo)}
      </table>
      <p style="margin:20px 0 0">
        <a href="${adminUrl}" style="background:#7b2cbf;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px">Abrir no painel</a>
      </p>
    </div>`;
}

async function sendEmail(n: QuoteNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!apiKey || !to) return;
  const from = process.env.NOTIFY_EMAIL_FROM ?? `${SITE_NAME} <onboarding@resend.dev>`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: to.split(",").map((e) => e.trim()),
      subject: `Novo ${n.tipo}: ${n.empresa}`,
      html: buildHtml(n),
    }),
  });
}

async function sendWebhook(n: QuoteNotification) {
  const url = process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  if (!url) return;
  const text = buildText(n);
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // text → Slack/n8n; content → Discord; campos extras são ignorados por quem não usa.
    body: JSON.stringify({ text, content: text, ...n }),
  });
}

export async function notifyNewQuote(n: QuoteNotification) {
  await Promise.allSettled([sendEmail(n), sendWebhook(n)]);
}
