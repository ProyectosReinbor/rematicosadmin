export interface PaymentData {
  payerName: string;
  amount: number;
  bank: string;
  reference: string;
  status: string;
  paymentMethod: string;
}

export interface PaymentProvider {
  name: string;
  receivePayment(data: PaymentData): Promise<PaymentResult>;
  validatePayment(reference: string): Promise<ValidationResult>;
  getPaymentStatus(reference: string): Promise<string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  reference: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  reference: string;
  status: string;
  message: string;
}