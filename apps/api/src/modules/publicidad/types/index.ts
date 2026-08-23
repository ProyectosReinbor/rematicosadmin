export interface AIImageProvider {
  name: string;
  generateImage(params: GenerateImageParams): Promise<AIImageResult>;
  analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysis>;
}

export interface GenerateImageParams {
  prompt: string;
  productImageBase64?: string;
  noBgImageBase64?: string;
  style: string;
  width: number;
  height: number;
  textLines: TextLine[];
}

export interface TextLine {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: "normal" | "bold";
  x?: number;
  y?: number;
}

export interface AIImageResult {
  imageBase64: string;
  imageUrl?: string;
  provider: string;
  generationTime: number;
  cost: number;
}

export interface ImageAnalysis {
  productType: string;
  colors: string[];
  category: string;
  orientation: "landscape" | "portrait" | "square";
  dominantColor: string;
  hasTransparency: boolean;
}

export interface BackgroundRemovalProvider {
  name: string;
  removeBackground(imageBuffer: Buffer, mimeType: string): Promise<Buffer>;
}

export interface AdTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
  icon: string;
}

export interface AdStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontFamily: string;
  effects: string[];
}

export interface GenerateAdRequest {
  imageBase64: string;
  mimeType: string;
  textLines: TextLine[];
  style: string;
  template: string;
  removeBackground?: boolean;
}

export interface AdHistoryItem {
  id: string;
  userId: string | null;
  originalUrl: string;
  noBgUrl: string | null;
  finalUrl: string | null;
  productType: string | null;
  colors: unknown;
  category: string | null;
  prompt: string | null;
  textStyle: string | null;
  template: string | null;
  provider: string | null;
  generationTime: number | null;
  cost: unknown;
  metadata: unknown;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
