import type { Request, Response } from "express";
import { billingService, resolvePlan } from "@/modules/billing/billing.service";

interface StripeLikeEvent {
  type: string;
  data: { object: Record<string, unknown> };
}

/**
 * Webhook público de pagamento (compatível com o formato de eventos da
 * Stripe; serviria igualmente para Hotmart com um mapeamento equivalente).
 *
 * Nota MVP: não há verificação de assinatura aqui (ex: `stripe-signature` +
 * `STRIPE_WEBHOOK_SECRET`) — para produção, validar a assinatura antes de
 * processar o corpo, usando o raw body da requisição.
 */
export const webhookController = {
  async handleStripeEvent(req: Request, res: Response): Promise<void> {
    const event = req.body as StripeLikeEvent;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const tenantId = session.client_reference_id as string | undefined;
        const stripeCustomerId = session.customer as string;
        const metadata = (session.metadata ?? {}) as Record<string, string | undefined>;

        await billingService.activateSubscription({
          tenantId,
          stripeCustomerId,
          plan: resolvePlan(metadata.plan),
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string;
        await billingService.markPastDue(stripeCustomerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;
        await billingService.cancelSubscription(stripeCustomerId);
        break;
      }

      default:
        // Evento não tratado neste MVP — confirmamos recebimento mesmo assim.
        break;
    }

    res.status(200).json({ received: true });
  },
};
