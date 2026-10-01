import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  if (err.code === 'P2002')
    return res
      .status(409)
      .json({
        error: { code: 'CONFLICT', message: 'Ya existe un registro con ese nombre en este nivel' },
      });
  if (err.code === 'P2025')
    return res
      .status(404)
      .json({ error: { code: 'NOT_FOUND', message: 'Registro no encontrado' } });
  if (err.code === 'P2003')
    return res
      .status(409)
      .json({
        error: {
          code: 'CONFLICT',
          message: 'El registro contiene elementos o su relación no es válida',
        },
      });
  logger.error(`[ERROR_HANDLER] ${req.method} ${req.path} - ${err.message}`, {
    stack: err.stack,
    code: err.code,
    statusCode: err.statusCode,
  });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode === 500 ? 'Error interno del servidor' : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
