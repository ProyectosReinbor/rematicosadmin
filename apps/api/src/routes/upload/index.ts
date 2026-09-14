import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { authenticateToken, requireRole } from "../../middleware/auth";

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "..", "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF."));
    }
  },
});

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  upload.array("files", 12),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "No se enviaron archivos" } });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const images = files.map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      altText: req.body.altText || file.originalname,
    }));

    res.status(201).json(images);
  }
);

export default router;
