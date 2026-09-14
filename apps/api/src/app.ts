import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { authenticateToken } from "./middleware/auth";
import simulatorRoutes from "./routes/simulator";
import paymentRoutes from "./routes/payments";
import auditRoutes from "./routes/audit";
import settingsRoutes from "./routes/settings";
import publicidadRoutes from "./modules/publicidad/routes";
import authRoutes from "./routes/auth";
import verificationRoutes from "./routes/verifications";
import productRoutes from "./routes/products";
import uploadRoutes from "./routes/upload";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.WEB_URL,
  process.env.STORE_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.use("/api/auth", authRoutes);

app.use("/api/simulator", simulatorRoutes);
app.use("/api/payments", authenticateToken, paymentRoutes);
app.use("/api/audit", authenticateToken, auditRoutes);
app.use("/api/settings", authenticateToken, settingsRoutes);
app.use("/api/publicidad", publicidadRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export { app };
