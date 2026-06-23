import crypto from "node:crypto";
import type { Request } from "express";
import { env } from "@/config/env";

/**
 * Validação de assinatura das requisições de webhook. Sem isso, qualquer um
 * que conheça a URL pública poderia forjar mensagens fingindo ser o Slack ou
 * o WhatsApp e fazer o assistente vazar conteúdo da base de conhecimento de
 * um tenant. As funções abaixo usam HMAC-SHA256 com comparação de tempo
 * constante (timingSafeEqual) para evitar ataques de timing.
 */

/** Janela máxima (segundos) entre o timestamp do Slack e o nosso relógio. */
const SLACK_MAX_SKEW_SECONDS = 60 * 5;

/**
 * Extrai o corpo bruto (Buffer) preservado pelo parser `express.raw`. A
 * verificação de assinatura PRECISA ser feita sobre os bytes originais — se o
 * JSON for reserializado, espaços/ordem mudam e a assinatura nunca confere.
 */
export function getRawBody(req: Request): Buffer {
  return Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
}

/** Comparação de tempo constante tolerante a tamanhos diferentes. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Valida a assinatura de um Event Subscription do Slack.
 * basestring = `v0:{timestamp}:{rawBody}` -> HMAC-SHA256 com o Signing Secret.
 * Ref: https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(req: Request): boolean {
  const signingSecret = env.slack.signingSecret;
  if (!signingSecret) {
    return false;
  }

  const timestamp = req.header("x-slack-request-timestamp");
  const signature = req.header("x-slack-signature");
  if (!timestamp || !signature) {
    return false;
  }

  // Proteção contra replay: rejeita requisições muito antigas.
  const tsSeconds = Number(timestamp);
  if (!Number.isFinite(tsSeconds)) {
    return false;
  }
  if (Math.abs(Date.now() / 1000 - tsSeconds) > SLACK_MAX_SKEW_SECONDS) {
    return false;
  }

  const basestring = `v0:${timestamp}:${getRawBody(req).toString("utf8")}`;
  const digest = crypto.createHmac("sha256", signingSecret).update(basestring).digest("hex");
  const expected = `v0=${digest}`;

  return safeEqual(expected, signature);
}

/**
 * Valida a assinatura `X-Hub-Signature-256` enviada pela Meta/WhatsApp.
 * HMAC-SHA256 do corpo bruto usando o App Secret do app Meta.
 * Ref: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export function verifyMetaSignature(req: Request): boolean {
  const appSecret = env.whatsapp.appSecret;
  if (!appSecret) {
    return false;
  }

  const signature = req.header("x-hub-signature-256");
  if (!signature) {
    return false;
  }

  const digest = crypto.createHmac("sha256", appSecret).update(getRawBody(req)).digest("hex");
  const expected = `sha256=${digest}`;

  return safeEqual(expected, signature);
}
