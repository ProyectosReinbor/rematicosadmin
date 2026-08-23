"use client";

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

const STYLE_ICONS: Record<string, string> = {
  moderno: "🎨",
  elegante: "🌹",
  oferta: "🏷️",
  minimalista: "✨",
  tienda: "🏪",
  marketplace: "🛒",
  redes: "📱",
};

const STYLE_COLORS: Record<string, string[]> = {
  moderno: ["#3B82F6", "#1E40AF", "#60A5FA"],
  elegante: ["#7C3AED", "#6D28D9", "#A78BFA"],
  oferta: ["#DC2626", "#B91C1C", "#FCD34D"],
  minimalista: ["#111827", "#6B7280", "#D1D5DB"],
  tienda: ["#059669", "#047857", "#34D399"],
  marketplace: ["#2563EB", "#1D4ED8", "#60A5FA"],
  redes: ["#EC4899", "#DB2777", "#F472B6"],
};

const STYLES = [
  { id: "moderno", name: "Moderno", desc: "Limpio y actual" },
  { id: "elegante", name: "Elegante", desc: "Sofisticado y premium" },
  { id: "oferta", name: "Oferta Agresiva", desc: "Llamativo para descuentos" },
  { id: "minimalista", name: "Minimalista", desc: "Simple y limpio" },
  { id: "tienda", name: "Tienda Física", desc: "Para promociones locales" },
  { id: "marketplace", name: "Marketplace", desc: "Estilo e-commerce" },
  { id: "redes", name: "Redes Sociales", desc: "Vibrante para Instagram/FB" },
];

export function StyleSelector({ selectedStyle, onStyleSelect }: StyleSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Estilo</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedStyle === style.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{STYLE_ICONS[style.id] || "🎨"}</span>
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {style.name}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{style.desc}</div>
            <div className="flex gap-1">
              {(STYLE_COLORS[style.id] || []).map((c, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
