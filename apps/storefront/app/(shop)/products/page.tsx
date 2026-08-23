import type { Metadata } from "next";
import { categories, products } from "../../lib/products";

export const metadata: Metadata = {
  title: "Productos — Adornos Remático",
  description: "Explora nuestro catálogo completo de adornos y decoraciones",
};

function formatCOP(value: number) {
  if (value === 0) return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuestros Productos</h1>
        <p className="mt-2 text-gray-600">
          Encuentra los insumos perfectos para tu proyecto creativo
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              cat === "Todos"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
              <img
                src={product.imagen}
                alt={product.titulo}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                {product.categoria.charAt(0).toUpperCase() +
                  product.categoria.slice(1)}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900">{product.titulo}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-3">
                {product.descripcion}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-400">{product.detalles}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  {product.precio_desde > 0
                    ? formatCOP(product.precio_desde)
                    : product.precio_texto}
                </span>
              </div>
              <a
                href={`https://wa.me/573001234567?text=Hola, me interesa: ${product.titulo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block w-full rounded-full bg-[var(--color-primary)] py-2 text-center text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                {product.boton_texto}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
