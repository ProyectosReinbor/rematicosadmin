import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    paymentVerification: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma), VerificationStatus: {} };
});

import { verificationService } from "../services/verification-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient() as unknown as {
  paymentVerification: {
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    aggregate: ReturnType<typeof vi.fn>;
  };
};

describe("VerificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a verification with PENDIENTE status when no receivedAmount", async () => {
      const mockResult = {
        id: "1",
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: 50000,
        status: "PENDIENTE",
        comparisonNotes: null,
        verifiedAt: null,
      };
      prisma.paymentVerification.create.mockResolvedValue(mockResult);

      const result = await verificationService.create({
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: 50000,
      });

      expect(result.status).toBe("PENDIENTE");
      expect(result.comparisonNotes).toBeNull();
      expect(prisma.paymentVerification.create).toHaveBeenCalledOnce();
    });

    it("should create VERIFICADA when receivedAmount matches expectedAmount", async () => {
      const mockResult = {
        id: "2",
        orderNumber: "PED-002",
        customerName: "Maria Garcia",
        expectedAmount: 50000,
        receivedAmount: 50000,
        status: "VERIFICADA",
        comparisonNotes: "Pago verificado: el valor recibido coincide con el valor esperado.",
        verifiedAt: new Date(),
      };
      prisma.paymentVerification.create.mockResolvedValue(mockResult);

      const result = await verificationService.create({
        orderNumber: "PED-002",
        customerName: "Maria Garcia",
        expectedAmount: 50000,
        receivedAmount: 50000,
      });

      expect(result.status).toBe("VERIFICADA");
      expect(result.comparisonNotes).toContain("coincide");
    });

    it("should create DISCREPANCIA when receivedAmount differs from expectedAmount", async () => {
      const mockResult = {
        id: "3",
        orderNumber: "PED-003",
        customerName: "Carlos Lopez",
        expectedAmount: 50000,
        receivedAmount: 40000,
        status: "DISCREPANCIA",
        comparisonNotes: "Discrepancia: se esperaban $50000 y se recibieron $40000. Diferencia: $-10000.",
        verifiedAt: new Date(),
      };
      prisma.paymentVerification.create.mockResolvedValue(mockResult);

      const result = await verificationService.create({
        orderNumber: "PED-003",
        customerName: "Carlos Lopez",
        expectedAmount: 50000,
        receivedAmount: 40000,
      });

      expect(result.status).toBe("DISCREPANCIA");
      expect(result.comparisonNotes).toContain("Discrepancia");
    });

    it("should create DISCREPANCIA when receivedAmount is more than expected", async () => {
      const mockResult = {
        id: "4",
        orderNumber: "PED-004",
        customerName: "Ana Martinez",
        expectedAmount: 50000,
        receivedAmount: 60000,
        status: "DISCREPANCIA",
        comparisonNotes: "Discrepancia: se esperaban $50000 y se recibieron $60000. Diferencia: $10000.",
        verifiedAt: new Date(),
      };
      prisma.paymentVerification.create.mockResolvedValue(mockResult);

      const result = await verificationService.create({
        orderNumber: "PED-004",
        customerName: "Ana Martinez",
        expectedAmount: 50000,
        receivedAmount: 60000,
      });

      expect(result.status).toBe("DISCREPANCIA");
    });
  });

  describe("getAll", () => {
    it("should return paginated results", async () => {
      const mockData = [
        { id: "1", orderNumber: "PED-001", customerName: "Juan" },
        { id: "2", orderNumber: "PED-002", customerName: "Maria" },
      ];
      prisma.paymentVerification.findMany.mockResolvedValue(mockData);
      prisma.paymentVerification.count.mockResolvedValue(2);

      const result = await verificationService.getAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("should filter by status", async () => {
      prisma.paymentVerification.findMany.mockResolvedValue([]);
      prisma.paymentVerification.count.mockResolvedValue(0);

      await verificationService.getAll({ status: "PENDIENTE" });

      const callArgs = prisma.paymentVerification.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe("PENDIENTE");
    });

    it("should search by orderNumber or customerName", async () => {
      prisma.paymentVerification.findMany.mockResolvedValue([]);
      prisma.paymentVerification.count.mockResolvedValue(0);

      await verificationService.getAll({ search: "PED-001" });

      const callArgs = prisma.paymentVerification.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe("getById", () => {
    it("should return a verification by id", async () => {
      const mockVerif = { id: "1", orderNumber: "PED-001" };
      prisma.paymentVerification.findUnique.mockResolvedValue(mockVerif);

      const result = await verificationService.getById("1");
      expect(result).toEqual(mockVerif);
    });

    it("should return null for non-existent id", async () => {
      prisma.paymentVerification.findUnique.mockResolvedValue(null);

      const result = await verificationService.getById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update and recalculate status when receivedAmount changes", async () => {
      const existing = {
        id: "1",
        orderNumber: "PED-001",
        expectedAmount: 50000,
        receivedAmount: null,
        status: "PENDIENTE",
      };
      const updated = {
        ...existing,
        receivedAmount: 50000,
        status: "VERIFICADA",
        comparisonNotes: "Pago verificado: el valor recibido coincide con el valor esperado.",
        verifiedAt: new Date(),
      };

      prisma.paymentVerification.findUnique.mockResolvedValue(existing);
      prisma.paymentVerification.update.mockResolvedValue(updated);

      const result = await verificationService.update("1", { receivedAmount: 50000 });

      expect(result?.status).toBe("VERIFICADA");
    });

    it("should return null if verification not found", async () => {
      prisma.paymentVerification.findUnique.mockResolvedValue(null);

      const result = await verificationService.update("non-existent", { receivedAmount: 50000 });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete and return true", async () => {
      prisma.paymentVerification.delete.mockResolvedValue({});

      const result = await verificationService.delete("1");
      expect(result).toBe(true);
    });

    it("should return false if delete fails", async () => {
      prisma.paymentVerification.delete.mockRejectedValue(new Error("Not found"));

      const result = await verificationService.delete("non-existent");
      expect(result).toBe(false);
    });
  });

  describe("getStats", () => {
    it("should return verification statistics", async () => {
      prisma.paymentVerification.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // pendientes
        .mockResolvedValueOnce(5)  // verificadas
        .mockResolvedValueOnce(1)  // discrepancias
        .mockResolvedValueOnce(1); // rechazadas
      prisma.paymentVerification.aggregate.mockResolvedValue({
        _sum: { expectedAmount: 500000, receivedAmount: 450000 },
      });

      const result = await verificationService.getStats();

      expect(result.total).toBe(10);
      expect(result.pendientes).toBe(3);
      expect(result.verificadas).toBe(5);
      expect(result.discrepancias).toBe(1);
      expect(result.rechazadas).toBe(1);
    });
  });
});
