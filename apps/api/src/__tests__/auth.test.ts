import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$12$hashedpassword"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock-token"),
    verify: vi.fn().mockReturnValue({ id: "user-1", email: "test@test.com", role: "ADMIN", name: "Test User" }),
  },
}));

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma), UserRole: {} };
});

vi.mock("../../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import authRouter from "../routes/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient() as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-1",
        name: "Test User",
        email: "test@test.com",
        role: "ADMIN",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: "test@test.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe("test@test.com");
    });

    it("should reject duplicate email", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "existing", email: "test@test.com" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: "test@test.com", password: "password123" });

      expect(res.status).toBe(409);
      expect(res.body.error.message.toLowerCase()).toContain("ya existe");
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(400);
    });

    it("should reject short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@test.com", password: "123" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Test User",
        email: "test@test.com",
        passwordHash: "$2a$12$hashedpassword",
        role: "ADMIN",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe("test@test.com");
    });

    it("should reject invalid credentials", async () => {
      const bcrypt = await import("bcryptjs");
      (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        passwordHash: "$2a$12$hashedpassword",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain("incorrectos");
    });

    it("should reject non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@test.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain("incorrectos");
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Test User",
        email: "test@test.com",
        role: "ADMIN",
      });

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "valid-refresh-token" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should reject missing refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user info with valid token", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Test User",
        email: "test@test.com",
        role: "ADMIN",
        createdAt: new Date(),
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer valid-token");

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("test@test.com");
    });

    it("should reject request without token", async () => {
      const res = await request(app)
        .get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const jwt = await import("jsonwebtoken");
      (jwt.default.verify as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(403);
    });
  });
});
