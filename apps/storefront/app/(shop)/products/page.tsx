"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToListModal from "../components/AddToListModal";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string; name: string; slug: string; description: string; unit: string;
  category: Category;
  images: { id: string; url: string; altText: string | null }[];
  options: { id: string; name: string; values: { id: string; value: string; imageUrl: string | null }[] }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const UNIT_LABELS: Record<string, string> = {
  UNIDAD: "unidad", METRO: "metro(s)", METRO_CUADRADO: "m²", METRO_LINEAL: "ml",
  KILOGRAMO: "kg", LIBRA: "lb", PAQUETE_1000: "paquete(s)", PAQUETE_500: "paquete(s)",
  PAQUETE_250: "paquete(s)", PAQUETE_100: "paquete(s)", DOCENA: "docena(s)",
  PAR: "par(es)", JUEGO: "juego(s)", ROLLO: "rollo(s)", CAJA: "caja(s)",
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [option, setOption] = useState("");
  const [optionValue, setOptionValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (option && optionValue) {
      params.set("option", option);
      params.set("optionValue", optionValue);
    }
    setLoading(true);
    fetch(`${API_URL}/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, search, option, optionValue]);

  const activeFilters = [category, optionValue].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-white border-b border-pink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Nuestros Productos</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Encuentra los insumos perfectos para tu proyecto creativo.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {activeFilters > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs">{activeFilters}</span>
            )}
          </button>
          <p className="text-sm text-gray-500">
            {loading ? "Buscando..." : `${products.length} producto${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className={`lg:block ${mobileFiltersOpen ? "block mb-5" : "hidden"}`}>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition"
                />
              </div>
              <select
                value={option}
                onChange={(e) => setOption(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition"
              >
                <option value="">Filtrar por atributo</option>
                <option value="Color">Color</option>
                <option value="Tamaño">Tamaño</option>
                <option value="Tipo">Tipo</option>
                <option value="Material">Material</option>
              </select>
              <input
                value={optionValue}
                onChange={(e) => setOptionValue(e.target.value)}
                placeholder="Ej. rojo, grande"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setCategory(""); setOptionValue(""); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  !category && !optionValue
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-rose-200/40"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(category === item.slug ? "" : item.slug)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    category === item.slug
                      ? "bg-[var(--color-primary)] text-white shadow-md shadow-rose-200/40"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 mb-4">
              <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sin resultados</h3>
            <p className="mt-1 text-sm text-gray-500">No encontramos productos con esos filtros. Intenta con otros parámetros.</p>
            <button
              onClick={() => { setCategory(""); setSearch(""); setOption(""); setOptionValue(""); }}
              className="mt-4 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText || product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.options.length > 0 && (
                      <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
                        {product.options.slice(0, 2).map((opt) => (
                          <span key={opt.id} className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                            {opt.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <span className="inline-block rounded-full bg-pink-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-[var(--color-primary)]">{product.category.name}</span>
                    <h2 className="mt-2 text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 hidden sm:block">{product.description}</p>
                    <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--color-primary)]">
                      Ver detalles
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <button
                    onClick={(e) => { e.preventDefault(); setModalProduct(product); }}
                    className="w-full rounded-xl border-2 border-[var(--color-primary)]/20 bg-pink-50/50 py-2 text-xs sm:text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                  >
                    + Agregar a mi lista
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalProduct && (
        <AddToListModal
          product={modalProduct}
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
