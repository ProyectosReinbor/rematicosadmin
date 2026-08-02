import { PaymentProvider, PaymentData, PaymentResult, ValidationResult } from "@rematicos/payments/types";
import { v4 as uuid } from "uuid";

const NAMES = ["Carlos", "María", "Juan", "Andrea", "Camila", "José", "Laura", "Sebastián", "Miguel", "Valentina"];
const LAST_NAMES = ["Pérez", "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Torres", "Ramírez", "Morales"];
const AMOUNTS = [5000, 10000, 20000, 35000, 48000, 75000, 120000, 250000];
const BANKS = ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogotá", "Daviplata", "Nequi", "RappiPay"];

export class SimulatorProvider implements PaymentProvider {
  name = "SimulatorProvider";

  async receivePayment(data: PaymentData): Promise<PaymentResult> {
    const paymentId = uuid();

    return {
      success: true,
      paymentId,
      reference: data.reference,
      message: "Payment simulated successfully",
    };
  }

  async validatePayment(reference: string): Promise<ValidationResult> {
    return {
      valid: true,
      reference,
      status: "APPROVED",
      message: "Payment validated by simulator",
    };
  }

  async getPaymentStatus(reference: string): Promise<string> {
    return "APPROVED";
  }

  generateRandomPayment(): PaymentData {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
    const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
    const refNum = String(Math.floor(Math.random() * 999999)).padStart(6, "0");

    return {
      payerName: `${name} ${lastName}`,
      amount,
      bank,
      reference: `QR-${refNum}`,
      status: "APPROVED",
      paymentMethod: "QR_BREB",
    };
  }
}

export const simulatorProvider = new SimulatorProvider();