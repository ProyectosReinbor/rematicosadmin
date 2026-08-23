import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).validatedBody = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: error.errors },
        });
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).validatedParams = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Parámetros inválidos", details: error.errors },
        });
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).validatedQuery = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Consulta inválida", details: error.errors },
        });
      }
      next(error);
    }
  };
}
