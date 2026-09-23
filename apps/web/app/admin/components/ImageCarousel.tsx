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
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-300">
        <div className="text-center">
          <svg className="mx-auto w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-xs">Sin imágenes</p>
        </div>
      </div>
    );
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
      <div className="relative overflow-hidden rounded-2xl bg-gray-50">
        <img src={images[current].url} alt={images[current].altText || "Imagen del producto"} className="aspect-square w-full object-cover" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => goTo(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-sm p-1.5 text-white hover:bg-black/60 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <button type="button" onClick={() => goTo(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-sm p-1.5 text-white hover:bg-black/60 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">{current + 1}/{images.length}</span>
        {editable && onRemove && (
          <button type="button" onClick={() => onRemove(images[current].id)} className="absolute top-2 right-2 rounded-xl bg-red-500/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-medium text-white hover:bg-red-600 transition">Eliminar</button>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, idx) => (
            <button key={img.id} type="button" onClick={() => setCurrent(idx)} draggable={editable} onDragStart={(e) => handleDragStart(e, idx)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx)} className={`h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${idx === current ? "border-rose-500 ring-2 ring-rose-500/20 shadow-sm" : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"} ${dragIdx === idx ? "opacity-40" : ""}`}>
              <img src={img.url} alt={img.altText || ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
