"use client";

import { useState } from "react";

interface ImageCarouselProps {
  images: { id: string; url: string; altText: string | null }[];
  onRemove?: (imageId: string) => void;
  onReorder?: (imageIds: string[]) => void;
  editable?: boolean;
}

export default function ImageCarousel({ images, onRemove, onReorder, editable = false }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  if (images.length === 0) {
    return <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 text-gray-400">Sin imágenes</div>;
  }

  const goTo = (dir: -1 | 1) => setCurrent((prev) => (prev + dir + images.length) % images.length);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx || !onReorder) { setDragIdx(null); return; }
    const ids = images.map((img) => img.id);
    const [moved] = ids.splice(dragIdx, 1);
    ids.splice(dropIdx, 0, moved);
    onReorder(ids);
    setDragIdx(null);
    setCurrent(dropIdx);
  };

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative">
        <img
          src={images[current].url}
          alt={images[current].altText || "Imagen del producto"}
          className="h-64 w-full rounded-lg border object-cover md:h-80"
        />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => goTo(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">‹</button>
            <button type="button" onClick={() => goTo(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">›</button>
          </>
        )}
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{current + 1}/{images.length}</span>
        {editable && onRemove && (
          <button type="button" onClick={() => onRemove(images[current].id)} className="absolute top-2 right-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600">Eliminar</button>
        )}
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setCurrent(idx)}
              draggable={editable}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              className={`h-14 w-14 flex-shrink-0 rounded border-2 object-cover transition-all ${
                idx === current ? "border-blue-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              } ${dragIdx === idx ? "opacity-40" : ""}`}
            >
              <img src={img.url} alt={img.altText || ""} className="h-full w-full rounded object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
