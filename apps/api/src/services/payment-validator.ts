import { z } from "zod";

export const createPaymentSchema = z.object({
  reference: z.string().min(1),
  bank: z.string().optional(),
  buyerName: z.string().min(1),
  buyerDocument: z.string().optional(),
  value: z.number().positive(),
  currency: z.string().default("COP"),
  dateTime: z.coerce.date(),
  status: z.enum(["PENDING", "VALIDATED", "CONFIRMED", "FAILED", "REJECTED", "REFUNDED"]).optional(),
  receiptNumber: z.string().optional(),
  channel: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  userId: z.string().uuid().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "VALIDATED", "CONFIRMED", "FAILED", "REJECTED", "REFUNDED"]),
});

export const paymentFiltersSchema = z.object({
  status: z.enum(["PENDING", "VALIDATED", "CONFIRMED", "FAILED", "REJECTED", "REFUNDED"]).optional(),
  bank: z.string().optional(),
  buyerName: z.string().optional(),
  reference: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1),
});