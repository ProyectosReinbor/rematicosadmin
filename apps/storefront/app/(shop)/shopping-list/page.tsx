"use client";

import Link from "next/link";
import { useShoppingList } from "../../lib/shopping-list-context";

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

export default function ShoppingListPage() {
  const { items, removeItem, updateQuantity, clearList } = useShoppingList();

  const buildWhatsAppMessage = () => {
    const lines = items.map((item) => {
      const attrs = Object.entries(item.selectedOptions)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      const unitLabel = UNIT_LABELS[item.unit] || item.unit;
      return `- ${item.productName}${attrs ? ` (${attrs})` : ""}: ${item.quantity} ${unitLabel}`;
    });
    return `Hola, me interesa consultar disponibilidad de los siguientes productos:\n\n${lines.join("\n")}\n\nGracias!`;
  };

  const sendWhatsApp = () => {
    const msg = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/573113487967?text=${msg}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900">Tu lista está vacía</h1>
        <p className="mt-2 text-gray-500">Explora nuestro catálogo y agrega productos que te interesen.</p>
        <Link href="/products" className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-white font-semibold hover:opacity-90 transition">
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi lista de compra ({items.length})</h1>
        <button onClick={clearList} className="text-sm text-red-500 hover:text-red-700">Limpiar lista</button>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const attrs = Object.entries(item.selectedOptions);
          const unitLabel = UNIT_LABELS[item.unit] || item.unit;
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
              {item.productImage ? (
                <img src={item.productImage} alt={item.productName} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Sin img</div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productSlug}`} className="font-semibold text-gray-900 hover:text-[var(--color-primary)] truncate block">
                  {item.productName}
                </Link>
                {attrs.length > 0 && (
                  <p className="text-sm text-gray-500 truncate">
                    {attrs.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">Venta por {unitLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 rounded-lg border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 rounded-lg border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 ml-2" title="Eliminar">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Resumen</h2>
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {items.map((item) => {
            const unitLabel = UNIT_LABELS[item.unit] || item.unit;
            const attrs = Object.values(item.selectedOptions).join(", ");
            return (
              <div key={item.id} className="flex justify-between">
                <span className="truncate mr-2">
                  {item.productName}{attrs ? ` (${attrs})` : ""}
                </span>
                <span className="shrink-0 font-medium">{item.quantity} {unitLabel}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={sendWhatsApp}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-center text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultar disponibilidad por WhatsApp
        </button>
      </div>
    </main>
  );
}
