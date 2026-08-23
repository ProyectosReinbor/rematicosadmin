import { AIImageProvider, GenerateImageParams, AIImageResult, ImageAnalysis } from "../types";

export class LocalAIProvider implements AIImageProvider {
  name = "local";

  async generateImage(params: GenerateImageParams): Promise<AIImageResult> {
    const serviceUrl = process.env.REMBG_SERVICE_URL || "http://localhost:7000";
    const startTime = Date.now();

    const body = {
      productName: params.textLines[0]?.text || "Producto",
      price: "",
      offer: "",
      style: params.style,
      imageBase64: params.noBgImageBase64 || params.productImageBase64 || "",
      mimeType: "image/png",
      format: "instagram",
      textLines: params.textLines.map((t) => ({
        text: t.text,
        x: t.x || 0.5,
        y: t.y || 0.1,
        fontSize: t.fontSize || 48,
        color: t.color || "#FFFFFF",
        fontWeight: t.fontWeight || "bold",
      })),
      removeBackground: false,
    };

    const response = await fetch(`${serviceUrl}/generate-advertisement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Local AI service error: ${err}`);
    }

    const data = (await response.json()) as { image: string; metadata: { generationTime: number } };

    const generationTime = Date.now() - startTime;

    return {
      imageBase64: data.image,
      provider: this.name,
      generationTime: data.metadata?.generationTime || generationTime,
      cost: 0,
    };
  }

  async analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysis> {
    // Análisis básico basado en tamaño y tipo
    const sizeKB = imageBuffer.length / 1024;
    const orientation = sizeKB > 500 ? "landscape" : "square";

    return {
      productType: "Producto",
      colors: ["#808080", "#404040", "#C0C0C0"],
      category: "general",
      orientation: orientation as "landscape" | "portrait" | "square",
      dominantColor: "#808080",
      hasTransparency: false,
    };
  }
}

export function getAIImageProvider(): AIImageProvider {
  return new LocalAIProvider();
}
