import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/shared/utils/ApiError";

/**
 * MVP: resolve o tenant a partir do header `x-tenant-id`.
 * Em produção isso deve vir de um JWT validado (Authorization: Bearer ...)
 * que carregue tenantId/userId/role assinados no login.
 */
export function requireTenant(req: Request, _res: Response, next: NextFunction): void {
  const tenantId = req.header("x-tenant-id");

  if (!tenantId) {
    throw ApiError.unauthorized("Header x-tenant-id é obrigatório");
  }

  req.tenantId = tenantId;
  next();
}
