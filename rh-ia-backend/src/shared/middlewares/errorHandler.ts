import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/shared/utils/ApiError";
import { logger } from "@/shared/utils/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { message: `Rota não encontrada: ${req.method} ${req.originalUrl}` },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Erro interno do servidor";
  logger.error("Erro não tratado na requisição", {
    method: _req.method,
    path: _req.originalUrl,
    error: err instanceof Error ? err.stack ?? err.message : String(err),
  });

  res.status(500).json({
    error: { message },
  });
}
