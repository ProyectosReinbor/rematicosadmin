import { AIImageProvider } from "../types";
import { OpenAIImageProvider } from "./openai-provider";

export function getAIImageProvider(): AIImageProvider {
  const provider = process.env.AI_IMAGE_PROVIDER || "openai";

  switch (provider) {
    case "openai":
    default:
      return new OpenAIImageProvider();
  }
}
