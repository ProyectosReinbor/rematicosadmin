import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Token de acceso requerido" } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Token inválido o expirado" } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "No autenticado" } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sin permisos" } });
    }
    next();
  };
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET || "", {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: object): string {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || "", {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
}
