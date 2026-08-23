export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface PaymentReceivedEvent extends BaseEvent {
  type: "Payment.Received";
  data: {
    paymentId: string;
    reference: string;
    bank: string | null;
    buyerName: string;
    buyerDocument: string | null;
    value: number;
    currency: string;
    dateTime: Date;
    channel: string | null;
    receiptNumber: string | null;
    metadata: Record<string, unknown>;
  };
}

export interface PaymentValidatedEvent extends BaseEvent {
  type: "Payment.Validated";
  data: {
    paymentId: string;
    reference: string;
    status: "VALIDATED" | "CONFIRMED" | "FAILED" | "REJECTED";
    validatedBy: string;
    notes?: string;
  };
}

export interface SaleCompletedEvent extends BaseEvent {
  type: "Sale.Completed";
  data: {
    saleId: string;
    paymentId: string;
    customerId: string;
    customerName: string;
    productId: string;
    productName: string;
    quantity: number;
    total: number;
    userId: string;
  };
}

export interface ProductLowStockEvent extends BaseEvent {
  type: "Product.LowStock";
  data: {
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  };
}

export type SystemEvent = PaymentReceivedEvent | PaymentValidatedEvent | SaleCompletedEvent | ProductLowStockEvent;