import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { ApiError } from "@/shared/utils/ApiError";

/**
 * Autorização por papel, aplicada APÓS `requireAuth` (depende de
 * `req.userRole`, já validado a partir do JWT). Usuários sem um dos papéis
 * permitidos recebem 403 — diferente de 401, que é falta/invalidade de
 * autenticação.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      throw new ApiError(403, "Você não tem permissão para acessar este recurso");
    }
    next();
  };
}
