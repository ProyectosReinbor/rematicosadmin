"use client";

import { useState } from "react";
import { useShoppingList } from "../../lib/shopping-list-context";

type Product = {
  id: string; name: string; slug: string; unit: string; images: { url: string; altText: string | null }[];
  options: { id: string; name: string; values: { id: string; value: string; imageUrl: string | null }[] }[];
};

const UNIT_LABELS: Record<string, string> = {
  UNIDAD: "unidad",
  METRO: "metro(s)",
  METRO_CUADRADO: "m²",
  METRO_LINEAL: "ml",
  KILOGRAMO: "kg",
  LIBRA: "lb",
  PAQUETE_1000: "paquete(s)",
  PAQUETE_500: "paquete(s)",
  PAQUETE_250: "paquete(s)",
  PAQUETE_100: "paquete(s)",
  DOCENA: "docena(s)",
  PAR: "par(es)",
  JUEGO: "juego(s)",
  ROLLO: "rollo(s)",
  CAJA: "caja(s)",
};

interface AddToListModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToListModal({ product, isOpen, onClose }: AddToListModalProps) {
  const { addItem } = useShoppingList();
  const [selection, setSelection] = useState<Record<string, string>>(
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]?.value || ""]))
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const unitLabel = UNIT_LABELS[product.unit] || product.unit;

  const handleAdd = () => {
    const mainImage = product.images[0]?.url || null;
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: mainImage,
      unit: product.unit,
      selectedOptions: { ...selection },
      quantity,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Agregar a mi lista</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          {product.images[0] && (
            <img src={product.images[0].url} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">Venta por {unitLabel}</p>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          {product.options.map((option) => (
            <div key={option.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{option.name}</label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={value.id}
                    onClick={() => setSelection((c) => ({ ...c, [option.name]: value.value }))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      selection[option.name] === value.value
                        ? "border-[var(--color-primary)] bg-pink-50 text-[var(--color-primary)]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {value.imageUrl && (
                      <img src={value.imageUrl} alt={value.value} className="mr-1 inline h-4 w-4 rounded-full object-cover" />
                    )}
                    {value.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad ({unitLabel})</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-9 w-20 rounded-lg border border-gray-300 text-center text-sm"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-9 w-9 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={added}
          className={`w-full rounded-xl py-3 text-center text-white font-semibold transition ${
            added ? "bg-green-500" : "bg-[var(--color-primary)] hover:opacity-90"
          }`}
        >
          {added ? "Agregado!" : "Agregar a mi lista"}
        </button>
      </div>
    </div>
  );
}
