import { z } from "zod";

const verificationStatusEnum = z.enum(["PENDIENTE", "VERIFICADA", "DISCREPANCIA", "RECHAZADA"]);
const verificationMethodEnum = z.enum(["MANUAL"]);

export const createVerificationSchema = z.object({
  orderNumber: z.string().min(1, "Número de pedido es obligatorio").max(100),
  customerName: z.string().min(1, "Nombre del cliente es obligatorio").max(200),
  expectedAmount: z.number().positive("El monto esperado debe ser mayor que 0"),
  expectedDate: z.coerce.date().optional(),
  receivedAmount: z.number().min(0).optional(),
  receivedDate: z.coerce.date().optional(),
  transactionRef: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  status: verificationStatusEnum.optional(),
  verificationMethod: verificationMethodEnum.optional(),
});

export const updateVerificationSchema = z.object({
  orderNumber: z.string().min(1).max(100).optional(),
  customerName: z.string().min(1).max(200).optional(),
  expectedAmount: z.number().positive().optional(),
  expectedDate: z.coerce.date().optional(),
  receivedAmount: z.number().min(0).optional(),
  receivedDate: z.coerce.date().optional(),
  transactionRef: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  status: verificationStatusEnum.optional(),
  verificationMethod: verificationMethodEnum.optional(),
  comparisonNotes: z.string().max(1000).optional(),
});

export const verificationFiltersSchema = z.object({
  status: verificationStatusEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid("ID de verificación inválido"),
});
