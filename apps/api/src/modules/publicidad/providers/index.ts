import { AIImageProvider } from "../types";
import { LocalAIProvider } from "./openai-provider";

export function getAIImageProvider(): AIImageProvider {
  return new LocalAIProvider();
}

export { LocalRembgProvider, getBackgroundRemovalProvider } from "./bg-removal-provider";
