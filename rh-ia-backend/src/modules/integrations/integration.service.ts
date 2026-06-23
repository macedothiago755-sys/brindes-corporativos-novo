import axios from "axios";
import { prisma } from "@/config/database";
import { env } from "@/config/env";
import { knowledgeService } from "@/modules/knowledge/knowledge.service";
import { logUsage } from "@/shared/services/usage.service";
import { logger } from "@/shared/utils/logger";

/**
 * Camada de integração Omnichannel. Concentra (a) a resolução do tenant a
 * partir dos identificadores externos do canal, (b) a execução do mesmo
 * pipeline RAG usado pelo endpoint `/knowledge/ask` e (c) o disparo das
 * respostas de volta para Slack e WhatsApp via Axios.
 */

/** Mantém apenas dígitos — telefones do WhatsApp chegam sem `+` e variam. */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export const integrationService = {
  /** Cruza o ID do workspace do Slack com o tenant que o cadastrou. */
  async findTenantBySlackWorkspace(workspaceId: string): Promise<string | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { slackWorkspaceId: workspaceId },
      select: { id: true },
    });
    return tenant?.id ?? null;
  },

  /** Descobre a qual empresa pertence o funcionário dono do número. */
  async findTenantByWhatsappPhone(phone: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { whatsappPhone: normalizePhone(phone) },
      select: { tenantId: true },
    });
    return user?.tenantId ?? null;
  },

  /**
   * Roda o motor RAG no contexto exclusivo do tenant e contabiliza o uso.
   * Reaproveita integralmente o `knowledgeService.ask`, garantindo o mesmo
   * isolamento por tenant do canal web.
   */
  async answerForTenant(tenantId: string, question: string): Promise<string> {
    const result = await knowledgeService.ask({ tenantId, question });
    await logUsage(tenantId, "KNOWLEDGE_ASK");
    return result.answer;
  },

  /** Posta a resposta no canal do Slack via Web API (chat.postMessage). */
  async sendSlackMessage(channel: string, text: string): Promise<void> {
    if (!env.slack.botToken) {
      logger.warn("SLACK_BOT_TOKEN ausente — resposta não enviada ao Slack", { channel });
      return;
    }

    const { data } = await axios.post(
      "https://slack.com/api/chat.postMessage",
      { channel, text },
      {
        headers: {
          Authorization: `Bearer ${env.slack.botToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        timeout: 10_000,
      },
    );

    // O Slack responde 200 mesmo em erro lógico; o sucesso está em `data.ok`.
    if (!data?.ok) {
      logger.error("Falha ao postar mensagem no Slack", { error: data?.error, channel });
    }
  },

  /** Envia a resposta de volta pela Cloud API oficial do WhatsApp (Meta). */
  async sendWhatsappMessage(toPhone: string, text: string): Promise<void> {
    if (!env.whatsapp.accessToken || !env.whatsapp.phoneNumberId) {
      logger.warn("Credenciais do WhatsApp ausentes — resposta não enviada", { toPhone });
      return;
    }

    const url = `https://graph.facebook.com/${env.whatsapp.graphApiVersion}/${env.whatsapp.phoneNumberId}/messages`;

    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: normalizePhone(toPhone),
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${env.whatsapp.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );
  },
};
