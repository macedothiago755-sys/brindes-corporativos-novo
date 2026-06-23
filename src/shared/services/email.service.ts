import { SITE_URL, SITE_NAME } from "@/lib/site-config";

/**
 * Notificações transacionais do ciclo de aprovação de orçamentos. Reaproveita
 * os mesmos canais opcionais de src/lib/notify.ts (Resend + webhook genérico),
 * mas mantido em arquivo próprio por representar um domínio diferente: ações
 * do cliente sobre uma proposta já enviada (aprovação / pedido de ajuste).
 * Falhas são engolidas para nunca quebrar a resposta ao cliente.
 */

type QuoteDecisionPayload = {
  quoteId: string;
  clienteNome: string;
  empresa: string;
  email: string;
  feedbackNotes?: string | null;
};

const adminUrl = `${SITE_URL}/admin/orcamentos`;

async function sendResendEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!apiKey || !to) return;
  const from = process.env.NOTIFY_EMAIL_FROM ?? `${SITE_NAME} <onboarding@resend.dev>`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((e) => e.trim()), subject, html }),
  });
}

async function sendWebhook(text: string, extra: Record<string, unknown>) {
  const url = process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, content: text, ...extra }),
  });
}

/** Disparado quando o cliente clica em "Aprovar Proposta": avisa o comercial imediatamente. */
export async function notifyQuoteApproved(payload: QuoteDecisionPayload) {
  const text = [
    `✅ Proposta aprovada pelo cliente`,
    "",
    `• Cliente: ${payload.clienteNome}`,
    `• Empresa: ${payload.empresa}`,
    `• E-mail: ${payload.email}`,
    "",
    `Abrir no painel: ${adminUrl}/${payload.quoteId}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
      <h2 style="margin:0 0 12px">✅ Proposta aprovada pelo cliente</h2>
      <p><strong>${payload.clienteNome}</strong> (${payload.empresa}) aprovou a proposta enviada.</p>
      <p style="margin:20px 0 0">
        <a href="${adminUrl}/${payload.quoteId}" style="background:#7b2cbf;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px">Abrir no painel</a>
      </p>
    </div>`;

  await Promise.allSettled([
    sendResendEmail(`Proposta aprovada: ${payload.empresa}`, html),
    sendWebhook(text, payload),
  ]);
}

/** Disparado quando o cliente clica em "Solicitar Ajuste": leva o feedback direto ao painel/comercial. */
export async function notifyQuoteAdjustmentRequested(payload: QuoteDecisionPayload) {
  const text = [
    `✏️ Ajuste solicitado pelo cliente`,
    "",
    `• Cliente: ${payload.clienteNome}`,
    `• Empresa: ${payload.empresa}`,
    `• E-mail: ${payload.email}`,
    `• Observações: ${payload.feedbackNotes || "(sem detalhes)"}`,
    "",
    `Abrir no painel: ${adminUrl}/${payload.quoteId}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
      <h2 style="margin:0 0 12px">✏️ Ajuste solicitado pelo cliente</h2>
      <p><strong>${payload.clienteNome}</strong> (${payload.empresa}) pediu um ajuste na proposta.</p>
      <p style="white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px">${payload.feedbackNotes || "(sem detalhes)"}</p>
      <p style="margin:20px 0 0">
        <a href="${adminUrl}/${payload.quoteId}" style="background:#7b2cbf;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px">Abrir no painel</a>
      </p>
    </div>`;

  await Promise.allSettled([
    sendResendEmail(`Ajuste solicitado: ${payload.empresa}`, html),
    sendWebhook(text, payload),
  ]);
}
