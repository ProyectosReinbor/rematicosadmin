import { Router, Request, Response } from "express";
import { simulatorProvider } from "../../services/providers/simulator-provider";
import { paymentService } from "../../services/payment-service";
import { eventBus } from "@rematicos/events";

const router = Router();

router.post("/payment", async (req: Request, res: Response) => {
  try {
    const { payerName, amount, bank, reference, status } = req.body;

    if (!payerName || !amount || !bank || !reference) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payment = await paymentService.receivePayment({
      payerName,
      amount: Number(amount),
      bank,
      reference,
      status: status || "APPROVED",
      paymentMethod: "QR_BREB",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        payerName: payment.payerName,
        amount: Number(payment.amount),
        bank: payment.bank,
        reference: payment.reference,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing simulated payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/random", async (_req: Request, res: Response) => {
  try {
    const randomPayment = simulatorProvider.generateRandomPayment();

    const payment = await paymentService.receivePayment({
      ...randomPayment,
      ipAddress: _req.ip,
    });

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        payerName: payment.payerName,
        amount: Number(payment.amount),
        bank: payment.bank,
        reference: payment.reference,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating random payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;