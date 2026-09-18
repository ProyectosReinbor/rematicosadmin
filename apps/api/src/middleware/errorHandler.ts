import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(`[ERROR_HANDLER] ${req.method} ${req.path} - ${err.message}`, { stack: err.stack, code: err.code, statusCode: err.statusCode });

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode === 500 ? "Error interno del servidor" : err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
