import { Router } from "express";
import { authController } from "@/modules/auth/auth.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { requireAuth } from "@/shared/middlewares/tenant.middleware";
import { requireRole } from "@/shared/middlewares/requireRole";

export const authRouter = Router();

// Públicas.
authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));

// Convite de novos usuários do tenant — exige estar autenticado como
// OWNER/ADMIN da própria empresa.
authRouter.post(
  "/users",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  asyncHandler(authController.inviteUser),
);
