import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { tenantRouter } from "@/modules/tenants/tenant.routes";
import { jobsRouter } from "@/modules/jobs/jobs.routes";
import { knowledgeRouter } from "@/modules/knowledge/knowledge.routes";
import { requireTenant } from "@/shared/middlewares/auth";
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

  // Gerenciamento de tenants não exige tenant resolvido (é quem os cria).
  v1.use("/tenants", tenantRouter);

  // Demais módulos operam no contexto de um tenant autenticado.
  v1.use("/jobs", requireTenant, jobsRouter);
  v1.use("/knowledge", requireTenant, knowledgeRouter);

  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
