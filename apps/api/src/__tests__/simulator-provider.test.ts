import { describe, it, expect } from "vitest";
import { simulatorProvider } from "../services/providers/simulator-provider";

describe("SimulatorProvider", () => {
  it("should generate a random payment", () => {
    const payment = simulatorProvider.generateRandomPayment();

    expect(payment).toHaveProperty("payerName");
    expect(payment).toHaveProperty("amount");
    expect(payment).toHaveProperty("bank");
    expect(payment).toHaveProperty("reference");
    expect(payment).toHaveProperty("status", "APPROVED");
    expect(payment).toHaveProperty("paymentMethod", "QR_BREB");
    expect(payment.reference).toMatch(/^QR-\d{6}$/);
    expect(payment.amount).toBeGreaterThan(0);
  });

  it("should receive a payment successfully", async () => {
    const result = await simulatorProvider.receivePayment({
      payerName: "Test User",
      amount: 50000,
      bank: "Bancolombia",
      reference: "QR-000001",
      status: "APPROVED",
      paymentMethod: "QR_BREB",
    });

    expect(result.success).toBe(true);
    expect(result.reference).toBe("QR-000001");
    expect(result).toHaveProperty("paymentId");
  });

  it("should validate a payment", async () => {
    const result = await simulatorProvider.validatePayment("QR-000001");

    expect(result.valid).toBe(true);
    expect(result.reference).toBe("QR-000001");
    expect(result.status).toBe("APPROVED");
  });

  it("should get payment status", async () => {
    const status = await simulatorProvider.getPaymentStatus("QR-000001");
    expect(status).toBe("APPROVED");
  });
});