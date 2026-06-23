import type { Request, Response } from "express";
import { env } from "@/config/env";
import { integrationService } from "@/modules/integrations/integration.service";
import {
  getRawBody,
  verifyMetaSignature,
  verifySlackSignature,
} from "@/modules/integrations/integration.security";
import { logger } from "@/shared/utils/logger";

/**
 * Controller central das integrações Omnichannel. Recebe os webhooks de
 * canais externos (Slack e WhatsApp), valida a autenticidade da requisição,
 * roda o pipeline RAG no contexto do tenant correto e devolve a resposta
 * pelo mesmo canal de origem.
 *
 * Padrão de resposta: confirmamos o recebimento (200) o mais rápido possível
 * e processamos o RAG de forma assíncrona ("fire-and-forget"). Tanto o Slack
 * (~3s) quanto a Meta reentregam o evento se o ACK demorar — responder antes
 * de chamar a IA evita mensagens duplicadas.
 */

interface SlackEvent {
  type?: string;
  subtype?: string;
  text?: string;
  user?: string;
  channel?: string;
  bot_id?: string;
  channel_type?: string;
}

interface SlackEventBody {
  type?: string;
  challenge?: string;
  team_id?: string;
  event?: SlackEvent;
}

interface WhatsappMessage {
  from?: string;
  type?: string;
  text?: { body?: string };
}

interface WhatsappBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsappMessage[];
      };
    }>;
  }>;
}

function parseJsonBody<T>(req: Request): T {
  const raw = getRawBody(req);
  if (raw.length === 0) {
    return {} as T;
  }
  return JSON.parse(raw.toString("utf8")) as T;
}

/** Remove menções do tipo `<@U123>` que o Slack injeta em app_mention. */
function stripSlackMentions(text: string): string {
  return text.replace(/<@[^>]+>/g, "").trim();
}

export const integrationController = {
  /**
   * POST /api/v1/integrations/slack
   * Recebe Event Subscriptions do Slack (app_mention e mensagens diretas).
   */
  async handleSlack(req: Request, res: Response): Promise<void> {
    if (!verifySlackSignature(req)) {
      logger.warn("Assinatura do Slack inválida — requisição rejeitada");
      res.status(401).json({ error: { message: "Assinatura inválida" } });
      return;
    }

    const body = parseJsonBody<SlackEventBody>(req);

    // a) Desafio de verificação inicial do Event Subscription.
    if (body.type === "url_verification") {
      res.status(200).json({ challenge: body.challenge });
      return;
    }

    // ACK imediato — o processamento do RAG roda em segundo plano.
    res.status(200).json({ ok: true });

    const event = body.event;
    if (!body.team_id || !event) {
      return;
    }

    // Ignora mensagens do próprio bot, edições e subtipos para evitar loops.
    if (event.bot_id || event.subtype || !event.user) {
      return;
    }
    if (event.type !== "app_mention" && event.type !== "message") {
      return;
    }

    const question = stripSlackMentions(event.text ?? "");
    const channel = event.channel;
    if (!question || !channel) {
      return;
    }

    void (async () => {
      try {
        const tenantId = await integrationService.findTenantBySlackWorkspace(body.team_id as string);
        if (!tenantId) {
          logger.warn("Workspace do Slack sem tenant associado", { teamId: body.team_id });
          await integrationService.sendSlackMessage(
            channel,
            "Este workspace ainda não está vinculado a uma empresa no RH IA. Procure o administrador.",
          );
          return;
        }

        const answer = await integrationService.answerForTenant(tenantId, question);
        await integrationService.sendSlackMessage(channel, answer);
      } catch (err) {
        logger.error("Erro ao processar evento do Slack", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();
  },

  /**
   * GET /api/v1/integrations/whatsapp
   * Verificação do webhook exigida pela Meta ao cadastrar a URL.
   */
  async verifyWhatsapp(req: Request, res: Response): Promise<void> {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === env.whatsapp.verifyToken && env.whatsapp.verifyToken) {
      res.status(200).send(typeof challenge === "string" ? challenge : "");
      return;
    }

    res.sendStatus(403);
  },

  /**
   * POST /api/v1/integrations/whatsapp
   * Recebe mensagens de texto enviadas pelos funcionários via WhatsApp.
   */
  async handleWhatsapp(req: Request, res: Response): Promise<void> {
    if (!verifyMetaSignature(req)) {
      logger.warn("Assinatura do WhatsApp (X-Hub-Signature-256) inválida — requisição rejeitada");
      res.status(401).json({ error: { message: "Assinatura inválida" } });
      return;
    }

    // ACK imediato; a Meta reentrega o evento se demorarmos para responder.
    res.status(200).json({ received: true });

    const body = parseJsonBody<WhatsappBody>(req);
    const messages: WhatsappMessage[] = [];
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const message of change.value?.messages ?? []) {
          messages.push(message);
        }
      }
    }

    for (const message of messages) {
      // Só tratamos mensagens de texto; ignoramos status de entrega/leitura.
      if (message.type !== "text" || !message.from || !message.text?.body) {
        continue;
      }

      const from = message.from;
      const question = message.text.body;

      void (async () => {
        try {
          const tenantId = await integrationService.findTenantByWhatsappPhone(from);
          if (!tenantId) {
            logger.warn("Telefone do WhatsApp sem funcionário/tenant associado", { from });
            await integrationService.sendWhatsappMessage(
              from,
              "Não reconhecemos o seu número. Peça ao RH da sua empresa para cadastrá-lo no RH IA.",
            );
            return;
          }

          const answer = await integrationService.answerForTenant(tenantId, question);
          await integrationService.sendWhatsappMessage(from, answer);
        } catch (err) {
          logger.error("Erro ao processar mensagem do WhatsApp", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    }
  },
};
