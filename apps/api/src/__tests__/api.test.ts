import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import simulatorRoutes from "../routes/simulator";
import paymentRoutes from "../routes/payments";

const app = express();
app.use(express.json());
app.use("/api/simulator", simulatorRoutes);
app.use("/api/payments", paymentRoutes);

describe("Simulator API", () => {
  it("POST /api/simulator/payment should create a payment", async () => {
    const res = await request(app)
      .post("/api/simulator/payment")
      .send({
        payerName: "Test User",
        amount: 50000,
        bank: "Bancolombia",
        reference: `QR-${Date.now()}`,
        status: "APPROVED",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payment).toHaveProperty("id");
    expect(res.body.payment.payerName).toBe("Test User");
  });

  it("POST /api/simulator/payment should return 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/simulator/payment")
      .send({ payerName: "Test" });

    expect(res.status).toBe(400);
  });

  it("POST /api/simulator/random should create a random payment", async () => {
    const res = await request(app)
      .post("/api/simulator/random");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payment).toHaveProperty("payerName");
  });
});

describe("Payments API", () => {
  it("GET /api/payments should return payments list", async () => {
    const res = await request(app)
      .get("/api/payments");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("payments");
    expect(res.body).toHaveProperty("total");
  });

  it("GET /api/payments/stats should return stats", async () => {
    const res = await request(app)
      .get("/api/payments/stats");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalToday");
    expect(res.body).toHaveProperty("countToday");
    expect(res.body).toHaveProperty("average");
  });
});