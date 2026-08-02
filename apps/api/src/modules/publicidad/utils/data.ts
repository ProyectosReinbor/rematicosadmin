import { AdTemplate, AdStyle } from "../types";

export const AD_TEMPLATES: AdTemplate[] = [
  { id: "instagram-post", name: "Instagram Post", width: 1080, height: 1080, category: "redes", icon: "instagram" },
  { id: "facebook-post", name: "Facebook Post", width: 1200, height: 630, category: "redes", icon: "facebook" },
  { id: "instagram-story", name: "Historia Instagram", width: 1080, height: 1920, category: "redes", icon: "smartphone" },
  { id: "facebook-story", name: "Historia Facebook", width: 1080, height: 1920, category: "redes", icon: "smartphone" },
  { id: "whatsapp-status", name: "Estado WhatsApp", width: 1080, height: 1920, category: "redes", icon: "smartphone" },
  { id: "web-banner", name: "Banner Web", width: 1920, height: 600, category: "web", icon: "globe" },
  { id: "youtube-thumb", name: "Miniatura YouTube", width: 1280, height: 720, category: "web", icon: "play" },
  { id: "mercadolibre", name: "Mercado Libre", width: 1200, height: 1200, category: "marketplace", icon: "shopping-cart" },
  { id: "olx", name: "OLX", width: 1024, height: 768, category: "marketplace", icon: "shopping-cart" },
  { id: "facebook-marketplace", name: "Marketplace Facebook", width: 1200, height: 1200, category: "marketplace", icon: "shopping-cart" },
  { id: "tiktok", name: "TikTok", width: 1080, height: 1920, category: "redes", icon: "smartphone" },
  { id: "portada", name: "Portada", width: 820, height: 312, category: "web", icon: "image" },
];

export const AD_STYLES: AdStyle[] = [
  {
    id: "moderno",
    name: "Moderno",
    description: "Limpio y actual con gradients sutiles",
    colors: { primary: "#3B82F6", secondary: "#1E40AF", accent: "#60A5FA", background: "#F8FAFC", text: "#1E293B" },
    fontFamily: "Inter, system-ui, sans-serif",
    effects: ["gradient", "shadow-sm"],
  },
  {
    id: "minimalista",
    name: "Minimalista",
    description: "Simple y elegante con mucho espacio",
    colors: { primary: "#111827", secondary: "#6B7280", accent: "#D1D5DB", background: "#FFFFFF", text: "#111827" },
    fontFamily: "Inter, system-ui, sans-serif",
    effects: ["clean"],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Luxury con dorados y negros",
    colors: { primary: "#B45309", secondary: "#92400E", accent: "#FCD34D", background: "#1C1917", text: "#FEF3C7" },
    fontFamily: "Georgia, serif",
    effects: ["gold-gradient", "shadow-lg"],
  },
  {
    id: "tecnologico",
    name: "Tecnológico",
    description: "Futurista con azules neón",
    colors: { primary: "#06B6D4", secondary: "#0891B2", accent: "#22D3EE", background: "#0F172A", text: "#E2E8F0" },
    fontFamily: "JetBrains Mono, monospace",
    effects: ["glow", "neon-border"],
  },
  {
    id: "elegante",
    name: "Elegante",
    description: "Refinado con tonos suaves",
    colors: { primary: "#7C3AED", secondary: "#6D28D9", accent: "#A78BFA", background: "#FAF5FF", text: "#2E1065" },
    fontFamily: "Playfair Display, Georgia, serif",
    effects: ["soft-shadow"],
  },
  {
    id: "oscuro",
    name: "Oscuro",
    description: "Tema oscuro profesional",
    colors: { primary: "#F59E0B", secondary: "#D97706", accent: "#FBBF24", background: "#18181B", text: "#FAFAFA" },
    fontFamily: "Inter, system-ui, sans-serif",
    effects: ["dark-gradient", "glow"],
  },
  {
    id: "claro",
    name: "Claro",
    description: "Tema claro y fresco",
    colors: { primary: "#10B981", secondary: "#059669", accent: "#34D399", background: "#FFFFFF", text: "#064E3B" },
    fontFamily: "Inter, system-ui, sans-serif",
    effects: ["clean", "light-shadow"],
  },
  {
    id: "colorido",
    name: "Colorido",
    description: "Vibrante y llamativo",
    colors: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F59E0B", background: "#FFF1F2", text: "#1F2937" },
    fontFamily: "Poppins, system-ui, sans-serif",
    effects: ["multicolor-gradient"],
  },
  {
    id: "black-friday",
    name: "Black Friday",
    description: "Negro y dorado, urgencia máxima",
    colors: { primary: "#DC2626", secondary: "#B91C1C", accent: "#FCD34D", background: "#000000", text: "#FFFFFF" },
    fontFamily: "Inter, system-ui, sans-serif",
    effects: ["dark-gradient", "gold-accent", "glow"],
  },
  {
    id: "cyber-monday",
    name: "Cyber Monday",
    description: "Azul eléctrico tech",
    colors: { primary: "#2563EB", secondary: "#1D4ED8", accent: "#38BDF8", background: "#020617", text: "#E0F2FE" },
    fontFamily: "JetBrains Mono, monospace",
    effects: ["neon-glow", "tech-grid"],
  },
  {
    id: "navidad",
    name: "Navidad",
    description: "Rojo, verde y dorado navideño",
    colors: { primary: "#DC2626", secondary: "#166534", accent: "#FCD34D", background: "#FEF2F2", text: "#14532D" },
    fontFamily: "Georgia, serif",
    effects: ["festive", "snowflakes"],
  },
  {
    id: "san-valentin",
    name: "San Valentín",
    description: "Rosa y rojo romántico",
    colors: { primary: "#E11D48", secondary: "#BE123C", accent: "#FB7185", background: "#FFF1F2", text: "#881337" },
    fontFamily: "Playfair Display, Georgia, serif",
    effects: ["hearts", "soft-gradient"],
  },
  {
    id: "empresarial",
    name: "Empresarial",
    description: "Corporativo y serio",
    colors: { primary: "#1E40AF", secondary: "#1E3A8A", accent: "#60A5FA", background: "#EFF6FF", text: "#1E3A8A" },
    fontFamily: "Inter, system-ui, sans-serif",
    effects: ["clean", "professional"],
  },
  {
    id: "infantil",
    name: "Infantil",
    description: "Divertido y colorido para niños",
    colors: { primary: "#F472B6", secondary: "#A78BFA", accent: "#34D399", background: "#FDF2F8", text: "#6B21A8" },
    fontFamily: "Comic Sans MS, cursive",
    effects: ["playful", "bubbles"],
  },
];

export function getTemplateById(id: string): AdTemplate | undefined {
  return AD_TEMPLATES.find((t) => t.id === id);
}

export function getStyleById(id: string): AdStyle | undefined {
  return AD_STYLES.find((s) => s.id === id);
}
