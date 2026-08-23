import { Router, Request, Response } from "express";
import { verificationService } from "../../services/verification-service";
import {
  createVerificationSchema,
  updateVerificationSchema,
  verificationFiltersSchema,
  idParamSchema,
} from "../../services/verification-validator";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await verificationService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const parsed = verificationFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Parámetros de consulta inválidos", details: parsed.error.errors },
      });
    }
    const result = await verificationService.getAll(parsed.data);
    res.json(result);
  } catch (error) {
    console.error("Error fetching verifications:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "ID inválido" } });
    }
    const verification = await verificationService.getById(parsed.data.id);
    if (!verification) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Verificación no encontrada" } });
    }
    res.json(verification);
  } catch (error) {
    console.error("Error fetching verification:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: parsed.error.errors },
      });
    }
    const verification = await verificationService.create(parsed.data);
    res.status(201).json(verification);
  } catch (error) {
    console.error("Error creating verification:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const paramParsed = idParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "ID inválido" } });
    }
    const bodyParsed = updateVerificationSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: bodyParsed.error.errors },
      });
    }
    const verification = await verificationService.update(paramParsed.data.id, bodyParsed.data);
    if (!verification) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Verificación no encontrada" } });
    }
    res.json(verification);
  } catch (error) {
    console.error("Error updating verification:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "ID inválido" } });
    }
    const deleted = await verificationService.delete(parsed.data.id);
    if (!deleted) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Verificación no encontrada" } });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting verification:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  }
});

export default router;
