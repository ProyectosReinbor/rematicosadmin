const API_URL = "";

export interface TextLine {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: "normal" | "bold";
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

export interface AdHistoryItem {
  id: string;
  userId: string | null;
  originalUrl: string;
  noBgUrl: string | null;
  finalUrl: string | null;
  productType: string | null;
  colors: string[] | null;
  category: string | null;
  prompt: string | null;
  textStyle: string | null;
  template: string | null;
  provider: string | null;
  generationTime: number | null;
  cost: number | null;
  metadata: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function generateAd(params: {
  imageBase64: string;
  mimeType: string;
  textLines: TextLine[];
  style: string;
  template: string;
  removeBackground?: boolean;
}): Promise<AdHistoryItem> {
  const res = await fetch(`${API_URL}/api/publicidad/generar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to generate ad" }));
    throw new Error(err.error || "Failed to generate ad");
  }
  return res.json();
}

export async function removeBackground(params: {
  imageBase64: string;
  mimeType: string;
}): Promise<{ imageBase64: string; mimeType: string; provider: string }> {
  const res = await fetch(`${API_URL}/api/publicidad/remover-fondo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to remove background" }));
    throw new Error(err.error || "Failed to remove background");
  }
  return res.json();
}

export async function fetchTemplates(): Promise<AdTemplate[]> {
  const res = await fetch(`${API_URL}/api/publicidad/templates`);
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

export async function fetchStyles(): Promise<AdStyle[]> {
  const res = await fetch(`${API_URL}/api/publicidad/styles`);
  if (!res.ok) throw new Error("Failed to fetch styles");
  return res.json();
}

export async function fetchAdHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{ items: AdHistoryItem[]; total: number; page: number; pageSize: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_URL}/api/publicidad/history?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function deleteAdHistoryItem(id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/publicidad/history/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}
