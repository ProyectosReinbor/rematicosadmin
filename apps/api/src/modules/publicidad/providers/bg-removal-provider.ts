import { BackgroundRemovalProvider } from "../types";

export class RemoveBgProvider implements BackgroundRemovalProvider {
  name = "removebg";

  async removeBackground(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
    const apiKey = process.env.REMOVEBG_API_KEY;
    if (!apiKey) throw new Error("REMOVEBG_API_KEY not configured");

    const base64 = imageBuffer.toString("base64");

    const formData = new URLSearchParams();
    formData.append("image_file_b64", base64);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Remove.bg API error: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(new Uint8Array(arrayBuffer));
  }
}

export class ClipdropProvider implements BackgroundRemovalProvider {
  name = "clipdrop";

  async removeBackground(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) throw new Error("CLIPDROP_API_KEY not configured");

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
    formData.append("image_file", blob, "image");

    const response = await fetch("https://clipdrop-api.co/remove-background/v1", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Clipdrop API error: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(new Uint8Array(arrayBuffer));
  }
}

export function getBackgroundRemovalProvider(): BackgroundRemovalProvider {
  const provider = process.env.BG_REMOVAL_PROVIDER || "removebg";

  switch (provider) {
    case "clipdrop":
      return new ClipdropProvider();
    case "removebg":
    default:
      return new RemoveBgProvider();
  }
}
