import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/shared/utils/ApiError";
import { verifyToken } from "@/shared/services/auth.service";

const BEARER_PREFIX = "Bearer ";

/**
 * Autentica a requisição via JWT (`Authorization: Bearer <token>`) e injeta
 * `req.tenantId`, `req.userId` e `req.userRole` a partir do payload assinado.
 * Toda query subsequente nos controllers DEVE usar `req.tenantId` — nunca
 * um tenantId vindo de body/query/params — garantindo isolamento entre
 * empresas clientes.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    throw ApiError.unauthorized("Token de autenticação ausente");
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    const payload = verifyToken(token);

    req.tenantId = payload.tenantId;
    req.userId = payload.userId;
    req.userRole = payload.role;
  } catch {
    throw ApiError.unauthorized("Token de autenticação inválido ou expirado");
  }

  next();
}
