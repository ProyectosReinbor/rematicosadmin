"use client";

import { useState } from "react";

interface TextLine {
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  color: string;
}

interface AdvertisementEditorProps {
  productName: string;
  price: string;
  offer: string;
  onProductNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onOfferChange: (value: string) => void;
}

export function AdvertisementEditor({
  productName,
  price,
  offer,
  onProductNameChange,
  onPriceChange,
  onOfferChange,
}: AdvertisementEditorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Texto del anuncio
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del producto
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            placeholder="Ej: Televisor Samsung 55&quot;"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="Ej: $999.000"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Oferta
            </label>
            <input
              type="text"
              value={offer}
              onChange={(e) => onOfferChange(e.target.value)}
              placeholder="Ej: 50% DESCUENTO"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormatSelectorProps {
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
}

const FORMATS = [
  { id: "instagram", name: "Instagram Post", dims: "1080x1080", icon: "📷" },
  { id: "historia", name: "Historia", dims: "1080x1920", icon: "📱" },
  { id: "facebook", name: "Facebook", dims: "1200x630", icon: "📘" },
  { id: "whatsapp", name: "WhatsApp", dims: "1080x1920", icon: "💬" },
];

export function FormatSelector({ selectedFormat, onFormatSelect }: FormatSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Formato</h3>
      <div className="grid grid-cols-2 gap-3">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => onFormatSelect(fmt.id)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedFormat === fmt.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{fmt.icon}</span>
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {fmt.name}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{fmt.dims}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
