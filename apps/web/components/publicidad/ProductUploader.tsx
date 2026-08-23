"use client";

import { useRef, useState } from "react";

interface ProductUploaderProps {
  onImageSelect: (file: File, preview: string, base64: string) => void;
  disabled?: boolean;
}

export function ProductUploader({ onImageSelect, disabled }: ProductUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert("Formato no soportado. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen no puede superar 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      onImageSelect(file, result, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors bg-white dark:bg-gray-900 ${
        dragOver ? "border-blue-400 bg-blue-50" : "hover:border-gray-400"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="text-6xl mb-4">📸</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Sube una foto del producto
      </h3>
      <p className="text-sm text-gray-500 mb-1">
        Arrastra una imagen o usa los botones
      </p>
      <p className="text-xs text-gray-400 mb-6">
        JPG, PNG o WEBP - Máximo 10MB
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Subir imagen
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Tomar foto
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
