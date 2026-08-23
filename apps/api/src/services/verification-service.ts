import { PrismaClient, PaymentVerification, VerificationStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

interface CreateVerificationData {
  orderNumber: string;
  customerName: string;
  expectedAmount: number;
  expectedDate?: Date;
  receivedAmount?: number;
  receivedDate?: Date;
  transactionRef?: string;
  notes?: string;
}

interface UpdateVerificationData {
  orderNumber?: string;
  customerName?: string;
  expectedAmount?: number;
  expectedDate?: Date;
  receivedAmount?: number;
  receivedDate?: Date;
  transactionRef?: string;
  notes?: string;
  status?: VerificationStatus;
  comparisonNotes?: string;
}

interface VerificationFilters {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

function compareAmounts(expected: number, received: number): { status: VerificationStatus; comparisonNotes: string } {
  const exp = new Decimal(expected);
  const rec = new Decimal(received);

  if (exp.equals(rec)) {
    return {
      status: "VERIFICADA",
      comparisonNotes: "Pago verificado: el valor recibido coincide con el valor esperado.",
    };
  }

  const diff = rec.minus(exp);
  const formattedExpected = exp.toDecimalPlaces(2).toString();
  const formattedReceived = rec.toDecimalPlaces(2).toString();
  const formattedDiff = diff.toDecimalPlaces(2).toString();

  return {
    status: "DISCREPANCIA",
    comparisonNotes: `Discrepancia: se esperaban $${formattedExpected} y se recibieron $${formattedReceived}. Diferencia: $${formattedDiff}.`,
  };
}

export class VerificationService {
  async create(data: CreateVerificationData): Promise<PaymentVerification> {
    let status: VerificationStatus = "PENDIENTE";
    let comparisonNotes: string | null = null;
    let verifiedAt: Date | null = null;

    if (data.receivedAmount !== undefined && data.receivedAmount !== null) {
      const result = compareAmounts(data.expectedAmount, data.receivedAmount);
      status = result.status;
      comparisonNotes = result.comparisonNotes;
      verifiedAt = new Date();
    }

    return prisma.paymentVerification.create({
      data: {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        expectedAmount: data.expectedAmount,
        expectedDate: data.expectedDate,
        receivedAmount: data.receivedAmount,
        receivedDate: data.receivedDate,
        transactionRef: data.transactionRef,
        notes: data.notes,
        status,
        comparisonNotes,
        verifiedAt,
      },
    });
  }

  async getAll(filters: VerificationFilters): Promise<{
    data: PaymentVerification[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { status, dateFrom, dateTo, search, page = 1, limit = 20 } = filters;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = dateFrom;
      if (dateTo) (where.createdAt as Record<string, Date>).lte = dateTo;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.paymentVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.paymentVerification.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<PaymentVerification | null> {
    return prisma.paymentVerification.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateVerificationData): Promise<PaymentVerification | null> {
    const existing = await prisma.paymentVerification.findUnique({ where: { id } });
    if (!existing) return null;

    const updateData: Record<string, unknown> = { ...data };

    const newReceivedAmount = data.receivedAmount !== undefined ? data.receivedAmount : existing.receivedAmount ? Number(existing.receivedAmount) : undefined;
    const newExpectedAmount = data.expectedAmount !== undefined ? data.expectedAmount : Number(existing.expectedAmount);

    if (newReceivedAmount !== undefined && newReceivedAmount !== null) {
      const result = compareAmounts(newExpectedAmount, newReceivedAmount);
      updateData.status = result.status;
      updateData.comparisonNotes = result.comparisonNotes;
      updateData.verifiedAt = new Date();
    } else if (data.status && data.status !== "PENDIENTE") {
      if (data.status === "RECHAZADA") {
        updateData.status = "RECHAZADA";
        updateData.verifiedAt = new Date();
        if (!data.comparisonNotes) {
          updateData.comparisonNotes = "Verificación rechazada manualmente.";
        }
      }
    }

    return prisma.paymentVerification.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.paymentVerification.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<{
    total: number;
    pendientes: number;
    verificadas: number;
    discrepancias: number;
    rechazadas: number;
    montoTotalEsperado: number;
    montoTotalRecibido: number;
  }> {
    const [total, pendientes, verificadas, discrepancias, rechazadas, aggregations] = await Promise.all([
      prisma.paymentVerification.count(),
      prisma.paymentVerification.count({ where: { status: "PENDIENTE" } }),
      prisma.paymentVerification.count({ where: { status: "VERIFICADA" } }),
      prisma.paymentVerification.count({ where: { status: "DISCREPANCIA" } }),
      prisma.paymentVerification.count({ where: { status: "RECHAZADA" } }),
      prisma.paymentVerification.aggregate({
        _sum: { expectedAmount: true, receivedAmount: true },
      }),
    ]);

    return {
      total,
      pendientes,
      verificadas,
      discrepancias,
      rechazadas,
      montoTotalEsperado: Number(aggregations._sum.expectedAmount || 0),
      montoTotalRecibido: Number(aggregations._sum.receivedAmount || 0),
    };
  }
}

export const verificationService = new VerificationService();
