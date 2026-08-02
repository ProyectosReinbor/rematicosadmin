import { AIImageProvider, GenerateImageParams, AIImageResult, ImageAnalysis } from "../types";

export class OpenAIImageProvider implements AIImageProvider {
  name = "openai";

  async generateImage(params: GenerateImageParams): Promise<AIImageResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const startTime = Date.now();

    const prompt = this.buildPrompt(params);

    const body: Record<string, unknown> = {
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: `${params.width}x${params.height}`,
      quality: "high",
    };

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const data = (await response.json()) as { data: Array<{ b64_json?: string; url?: string }> };
    const imageBase64 = data.data[0].b64_json || "";
    const imageUrl = data.data[0].url;

    const generationTime = Date.now() - startTime;

    return {
      imageBase64,
      imageUrl,
      provider: this.name,
      generationTime,
      cost: this.estimateCost(params.width, params.height),
    };
  }

  async analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysis> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const base64 = imageBuffer.toString("base64");
    const mimeType = this.detectMimeType(imageBuffer);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this product image and return a JSON object with:
- productType: what the product is (e.g. "Televisor", "Nevera", "Celular", "Sofá", "Moto", "Computador", "Zapatos", "Mesa", "Herramienta", "Electrodoméstico")
- colors: array of 3-5 dominant colors as hex codes
- category: product category (e.g. "electrónica", "muebles", "vehículos", "ropa", "herramientas", "hogar")
- orientation: "landscape", "portrait", or "square"
- dominantColor: the most prominent color as hex
- hasTransparency: boolean

Return ONLY the JSON, no other text.`,
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "low" },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI analysis error: ${err}`);
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices[0].message.content;

    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as ImageAnalysis;
    } catch {
      return {
        productType: "Producto",
        colors: ["#808080", "#404040", "#C0C0C0"],
        category: "general",
        orientation: "square",
        dominantColor: "#808080",
        hasTransparency: false,
      };
    }
  }

  private buildPrompt(params: GenerateImageParams): string {
    const parts: string[] = [
      `Create a professional advertising image for a product.`,
      `Style: ${params.style}.`,
      `The background should be professional with proper lighting, shadows, and composition.`,
    ];

    if (params.noBgImageBase64) {
      parts.push(`Integrate the product naturally into the composition with realistic shadows and lighting.`);
    }

    if (params.textLines.length > 0) {
      parts.push(`Include the following text with proper visual hierarchy:`);
      params.textLines.forEach((line, i) => {
        const size = line.fontSize ? ` (size ${line.fontSize})` : "";
        const weight = line.fontWeight === "bold" ? " bold" : "";
        parts.push(`- "${line.text}"${size}${weight}`);
      });
    }

    parts.push(`Make it look like it was designed by a professional graphic designer.`);
    return parts.join(" ");
  }

  private estimateCost(width: number, height: number): number {
    const pixels = width * height;
    if (pixels <= 1024 * 1024) return 0.04;
    if (pixels <= 2048 * 2048) return 0.08;
    return 0.12;
  }

  private detectMimeType(buffer: Buffer): string {
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";
    if (buffer[0] === 0x52 && buffer[1] === 0x49) return "image/webp";
    return "image/jpeg";
  }
}
