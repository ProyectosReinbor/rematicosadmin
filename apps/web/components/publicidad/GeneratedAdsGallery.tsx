"use client";

import { useEffect, useState } from "react";

interface AdItem {
  id: string;
  finalUrl: string | null;
  productType: string | null;
  status: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

interface GeneratedAdsGalleryProps {
  onBack: () => void;
}

export function GeneratedAdsGallery({ onBack }: GeneratedAdsGalleryProps) {
  const [items, setItems] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/publicidad/history?pageSize=50")
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicidad?")) return;
    try {
      await fetch(`/api/publicidad/history/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleDownload = (item: AdItem) => {
    if (!item.finalUrl) return;
    const link = document.createElement("a");
    link.href = item.finalUrl;
    link.download = `publicidad-${item.id}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-3xl mb-4">⏳</div>
        <p className="text-gray-500">Cargando historial...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-gray-500 mb-4">No hay publicidades creadas aún</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Crear primera publicidad
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Historial ({items.length})
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Crear nueva
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden"
          >
            {item.finalUrl && (
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <img
                  src={item.finalUrl}
                  alt="Ad"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("es-CO")}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {item.status}
                </span>
              </div>
              {item.productType && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {item.productType}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(item)}
                  className="flex-1 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Descargar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
