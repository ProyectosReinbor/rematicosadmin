import { Router, Request, Response } from "express";
import { adImageService } from "../services/ad-image-service";
import { AD_TEMPLATES, AD_STYLES } from "../utils/data";
import { GenerateAdRequest } from "../types";

const router = Router();

router.post("/generar", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, textLines, style, template, removeBackground } = req.body as GenerateAdRequest;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }
    if (!textLines || !Array.isArray(textLines) || textLines.length === 0) {
      return res.status(400).json({ error: "textLines array is required" });
    }
    if (!style) {
      return res.status(400).json({ error: "style is required" });
    }
    if (!template) {
      return res.status(400).json({ error: "template is required" });
    }

    const result = await adImageService.generateAd(
      {
        imageBase64,
        mimeType: mimeType || "image/jpeg",
        textLines,
        style,
        template,
        removeBackground,
      },
      req.body.userId
    );

    res.json(result);
  } catch (error) {
    console.error("Error generating ad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/remover-fondo", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const { getBackgroundRemovalProvider } = await import("../providers/bg-removal-provider");
    const provider = getBackgroundRemovalProvider();
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const result = await provider.removeBackground(imageBuffer, mimeType || "image/jpeg");

    res.json({
      imageBase64: result.toString("base64"),
      mimeType: "image/png",
      provider: provider.name,
    });
  } catch (error) {
    console.error("Error removing background:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/templates", (_req: Request, res: Response) => {
  res.json(AD_TEMPLATES);
});

router.get("/styles", (_req: Request, res: Response) => {
  res.json(AD_STYLES);
});

router.get("/history", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const userId = req.query.userId as string | undefined;

    const result = await adImageService.getHistory(userId, page, pageSize);
    res.json(result);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/history/:id", async (req: Request, res: Response) => {
  try {
    const item = await adImageService.getHistoryItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching history item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/history/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await adImageService.deleteHistoryItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting history item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
