import { PrismaClient } from "@prisma/client";
import { getAIImageProvider } from "../providers";
import { getBackgroundRemovalProvider } from "../providers/bg-removal-provider";
import { getStyleById, getTemplateById } from "../utils/data";
import {
  GenerateAdRequest,
  AdHistoryItem,
} from "../types";

const prisma = new PrismaClient();

export class AdImageService {
  async generateAd(request: GenerateAdRequest, userId?: string): Promise<AdHistoryItem> {
    const startTime = Date.now();

    const imageBuffer = Buffer.from(request.imageBase64, "base64");

    let noBgBuffer: Buffer | null = null;
    let noBgUrl: string | null = null;

    if (request.removeBackground !== false) {
      try {
        const bgRemoval = getBackgroundRemovalProvider();
        noBgBuffer = await bgRemoval.removeBackground(imageBuffer, request.mimeType);
        noBgUrl = `data:image/png;base64,${noBgBuffer.toString("base64")}`;
      } catch (err) {
        console.warn("Background removal failed, continuing without:", err);
        noBgBuffer = null;
      }
    }

    const aiProvider = getAIImageProvider();
    const template = getTemplateById(request.template);
    const style = getStyleById(request.style);

    let analysis;
    try {
      analysis = await aiProvider.analyzeImage(imageBuffer);
    } catch (err) {
      console.warn("Image analysis failed, using defaults:", err);
      analysis = {
        productType: "Producto",
        colors: ["#808080"],
        category: "general",
        orientation: "square" as const,
        dominantColor: "#808080",
        hasTransparency: false,
      };
    }

    const width = template?.width || 1080;
    const height = template?.height || 1080;

    const result = await aiProvider.generateImage({
      prompt: request.textLines.map((t) => t.text).join(", "),
      productImageBase64: request.imageBase64,
      noBgImageBase64: noBgBuffer?.toString("base64"),
      style: request.style,
      width,
      height,
      textLines: request.textLines,
    });

    const generationTime = Date.now() - startTime;

    const adImage = await prisma.adImage.create({
      data: {
        userId: userId || null,
        originalUrl: `data:${request.mimeType};base64,${request.imageBase64.substring(0, 100)}...`,
        noBgUrl: noBgUrl || null,
        finalUrl: result.imageUrl || `data:image/png;base64,${result.imageBase64}`,
        productType: analysis.productType,
        colors: analysis.colors,
        category: analysis.category,
        prompt: request.textLines.map((t) => t.text).join("\n"),
        textStyle: request.style,
        template: request.template,
        provider: result.provider,
        generationTime,
        cost: result.cost,
        metadata: JSON.parse(JSON.stringify({
          textLines: request.textLines,
          analysis,
          style: style?.id || request.style,
          template: template?.id || request.template,
          dimensions: { width, height },
        })),
        status: "completed",
      },
    });

    return adImage as AdHistoryItem;
  }

  async getHistory(userId?: string, page = 1, pageSize = 20): Promise<{ items: AdHistoryItem[]; total: number; page: number; pageSize: number }> {
    const where = userId ? { userId } : {};
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.adImage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.adImage.count({ where }),
    ]);

    return {
      items: items as AdHistoryItem[],
      total,
      page,
      pageSize,
    };
  }

  async getHistoryItem(id: string): Promise<AdHistoryItem | null> {
    const item = await prisma.adImage.findUnique({ where: { id } });
    return item as AdHistoryItem | null;
  }

  async deleteHistoryItem(id: string): Promise<boolean> {
    try {
      await prisma.adImage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const adImageService = new AdImageService();
