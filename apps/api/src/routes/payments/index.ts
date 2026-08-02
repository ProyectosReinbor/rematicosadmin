import { Router, Request, Response } from "express";
import { paymentService } from "../../services/payment-service";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, dateFrom, dateTo, page, pageSize } = req.query;

    const result = await paymentService.getPayments({
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 50,
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await paymentService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const payments = await paymentService.getRecentPayments(limit);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;