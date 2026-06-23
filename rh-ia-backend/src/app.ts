import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "@/modules/auth/auth.routes";
import { tenantRouter } from "@/modules/tenants/tenant.routes";
import { jobsRouter } from "@/modules/jobs/jobs.routes";
import { knowledgeRouter } from "@/modules/knowledge/knowledge.routes";
import { webhookRouter } from "@/modules/billing/webhook.routes";
import { requireAuth } from "@/shared/middlewares/tenant.middleware";
import { errorHandler, notFoundHandler } from "@/shared/middlewares/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const v1 = express.Router();

  // Rotas públicas: registro/login criam o tenant e emitem o JWT.
  v1.use("/auth", authRouter);

  // Webhook público de pagamento (sem JWT — autenticidade viria da
  // verificação de assinatura do provedor, fora do escopo deste MVP).
  v1.use("/webhooks", webhookRouter);

  // Gerenciamento avulso de tenants (uso administrativo/interno).
  v1.use("/tenants", tenantRouter);

  // Demais módulos exigem JWT válido; tenantId/userId vêm exclusivamente
  // do token, nunca de body/query/params.
  v1.use("/jobs", requireAuth, jobsRouter);
  v1.use("/knowledge", requireAuth, knowledgeRouter);

  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
