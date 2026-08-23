import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { generateToken, generateRefreshToken, authenticateToken } from "../../middleware/auth";
import { logger } from "../../utils/logger";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Nombre, email y contraseña son obligatorios" },
      });
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Nombre inválido" },
      });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email inválido" },
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "La contraseña debe tener al menos 8 caracteres" },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: { code: "CONFLICT", message: "Ya existe un usuario con ese email" },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole: UserRole = role === "ADMIN" ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
      },
    });

    const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Error registering user:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email y contraseña son obligatorios" },
      });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Correo o contraseña incorrectos" },
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Correo o contraseña incorrectos" },
      });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Error logging in:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Refresh token es obligatorio" },
      });
    }

    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "") as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Usuario no encontrado" },
      });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const newAccessToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Refresh token inválido" },
      });
    }
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Refresh token expirado" },
      });
    }
    logger.error("Error refreshing token:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "No autenticado" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Usuario no encontrado" },
      });
    }

    res.json(user);
  } catch (error) {
    logger.error("Error fetching user:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

export default router;
