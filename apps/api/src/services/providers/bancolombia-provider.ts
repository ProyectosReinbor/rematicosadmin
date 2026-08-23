interface PaymentData {
  payerName: string;
  amount: number;
  bank: string;
  reference: string;
  status: string;
  paymentMethod: string;
}

interface PaymentResult {
  success: boolean;
  paymentId: string;
  reference: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  reference: string;
  status: string;
  message: string;
}

interface PaymentProvider {
  name: string;
  receivePayment(data: PaymentData): Promise<PaymentResult>;
  validatePayment(reference: string): Promise<ValidationResult>;
  getPaymentStatus(reference: string): Promise<string>;
}

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