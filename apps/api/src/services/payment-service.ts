import { PrismaClient, Payment } from "@prisma/client";
import { eventBus, SystemEvent } from "@rematicos/events";

const prisma = new PrismaClient();

export class PaymentService {
  async receivePayment(data: {
    payerName: string;
    amount: number;
    bank: string;
    reference: string;
    status: string;
    paymentMethod: string;
    ipAddress?: string;
  }): Promise<Payment> {
    const payment = await prisma.payment.create({
      data: {
        payerName: data.payerName,
        amount: data.amount,
        bank: data.bank,
        reference: data.reference,
        status: data.status,
        paymentMethod: data.paymentMethod,
      },
    });

    await eventBus.publish(
      eventBus.createEvent(
        "PaymentReceived",
        {
          id: payment.id,
          payerName: payment.payerName,
          amount: Number(payment.amount),
          bank: payment.bank,
          reference: payment.reference,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
        },
        "payment-service"
      )
    );

    await eventBus.publish(
      eventBus.createEvent(
        "PaymentSaved",
        {
          id: payment.id,
          reference: payment.reference,
          payerName: payment.payerName,
          amount: Number(payment.amount),
        },
        "payment-service"
      )
    );

    await eventBus.publish(
      eventBus.createEvent(
        "VoiceAnnouncementRequested",
        {
          payerName: payment.payerName,
          amount: Number(payment.amount),
          message: `${payment.payerName}, tu pago ha sido recibido. Gracias por comprar aquí. Que tengas un excelente día.`,
        },
        "payment-service"
      )
    );

    await this.logAudit({
      action: "PAYMENT_RECEIVED",
      entity: "Payment",
      entityId: payment.id,
      details: { ...payment, amount: Number(payment.amount) },
      ipAddress: data.ipAddress,
    });

    return payment;
  }

  async getPayments(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ payments: Payment[]; total: number; page: number; pageSize: number }> {
    const { status, dateFrom, dateTo, page = 1, pageSize = 50 } = filters;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const skip = (page - 1) * pageSize;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total, page, pageSize };
  }

  async getStats(): Promise<{
    totalToday: number;
    countToday: number;
    average: number;
    max: number;
    min: number;
    lastPayment: Payment | null;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [payments, aggregations] = await Promise.all([
      prisma.payment.findMany({
        where: { createdAt: { gte: today } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { amount: true },
        _avg: { amount: true },
        _max: { amount: true },
        _min: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalToday: Number(aggregations._sum.amount || 0),
      countToday: aggregations._count,
      average: Number(aggregations._avg.amount || 0),
      max: Number(aggregations._max.amount || 0),
      min: Number(aggregations._min.amount || 0),
      lastPayment: payments[0] || null,
    };
  }

  async getRecentPayments(limit: number = 10): Promise<Payment[]> {
    return prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  private async logAudit(data: {
    action: string;
    entity: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details || {},
        ipAddress: data.ipAddress,
      },
    });
  }
}

export const paymentService = new PaymentService();