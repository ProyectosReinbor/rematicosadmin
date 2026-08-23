export interface BackgroundRemovalProvider {
  name: string;
  removeBackground(imageBuffer: Buffer, mimeType: string): Promise<Buffer>;
}

export class LocalRembgProvider implements BackgroundRemovalProvider {
  name = "local-rembg";

  async removeBackground(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
    const serviceUrl = process.env.REMBG_SERVICE_URL || "http://localhost:7000";

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
    formData.append("file", blob, "image");

    const response = await fetch(`${serviceUrl}/remove-background`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`rembg service error: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(new Uint8Array(arrayBuffer));
  }
}

export function getBackgroundRemovalProvider(): BackgroundRemovalProvider {
  return new LocalRembgProvider();
}
