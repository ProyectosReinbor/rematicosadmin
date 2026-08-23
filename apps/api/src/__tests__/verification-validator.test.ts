import { describe, it, expect } from "vitest";
import {
  createVerificationSchema,
  updateVerificationSchema,
  verificationFiltersSchema,
  idParamSchema,
} from "../services/verification-validator";

describe("Verification Validators", () => {
  describe("createVerificationSchema", () => {
    it("should accept valid data", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: 50000,
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty orderNumber", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "",
        customerName: "Juan Perez",
        expectedAmount: 50000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty customerName", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "PED-001",
        customerName: "",
        expectedAmount: 50000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject expectedAmount <= 0", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative expectedAmount", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: -100,
      });
      expect(result.success).toBe(false);
    });

    it("should accept optional receivedAmount", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: 50000,
        receivedAmount: 50000,
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative receivedAmount", () => {
      const result = createVerificationSchema.safeParse({
        orderNumber: "PED-001",
        customerName: "Juan Perez",
        expectedAmount: 50000,
        receivedAmount: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateVerificationSchema", () => {
    it("should accept partial updates", () => {
      const result = updateVerificationSchema.safeParse({
        receivedAmount: 50000,
      });
      expect(result.success).toBe(true);
    });

    it("should accept status update", () => {
      const result = updateVerificationSchema.safeParse({
        status: "RECHAZADA",
        comparisonNotes: "Motivo del rechazo",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = updateVerificationSchema.safeParse({
        status: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("verificationFiltersSchema", () => {
    it("should accept valid filters", () => {
      const result = verificationFiltersSchema.safeParse({
        status: "PENDIENTE",
        page: 1,
        limit: 20,
      });
      expect(result.success).toBe(true);
    });

    it("should apply defaults", () => {
      const result = verificationFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should reject limit > 100", () => {
      const result = verificationFiltersSchema.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("idParamSchema", () => {
    it("should accept valid UUID", () => {
      const result = idParamSchema.safeParse({
        id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = idParamSchema.safeParse({
        id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });
});
