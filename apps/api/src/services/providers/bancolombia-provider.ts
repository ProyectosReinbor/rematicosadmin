import { PaymentProvider, PaymentData, PaymentResult, ValidationResult } from "@rematicos/payments/types";

export class BancolombiaProvider implements PaymentProvider {
  name = "BancolombiaProvider";

  async receivePayment(data: PaymentData): Promise<PaymentResult> {
    throw new Error("BancolombiaProvider not implemented. Waiting for official API access.");
  }

  async validatePayment(reference: string): Promise<ValidationResult> {
    throw new Error("BancolombiaProvider not implemented. Waiting for official API access.");
  }

  async getPaymentStatus(reference: string): Promise<string> {
    throw new Error("BancolombiaProvider not implemented. Waiting for official API access.");
  }
}

export const bancolombiaProvider = new BancolombiaProvider();