import express, { Router } from "express";
import { integrationController } from "@/modules/integrations/integration.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";

export const integrationRouter = Router();

/**
 * As rotas de integração precisam do CORPO BRUTO (Buffer) para validar as
 * assinaturas HMAC do Slack e do WhatsApp — por isso usam `express.raw` em vez
 * do `express.json()` global. Sem os bytes originais, a reserialização do JSON
 * quebraria a verificação de assinatura. O controller faz o `JSON.parse`
 * manualmente APÓS validar a assinatura.
 */
const rawBody = express.raw({ type: "*/*", limit: "1mb" });

// Slack: Event Subscriptions (desafio de verificação + mensagens).
integrationRouter.post("/slack", rawBody, asyncHandler(integrationController.handleSlack));

// WhatsApp: verificação do webhook (GET) + recebimento de mensagens (POST).
integrationRouter.get("/whatsapp", asyncHandler(integrationController.verifyWhatsapp));
integrationRouter.post("/whatsapp", rawBody, asyncHandler(integrationController.handleWhatsapp));
