"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AddToListModal from "../components/AddToListModal";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string; name: string; slug: string; description: string; unit: string;
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; altText: string | null }[];
  options: { id: string; name: string; values: { id: string; value: string }[] }[];
};
type Pagination = { page: number; limit: number; total: number; totalPages: number };

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
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 24, total: 0, totalPages: 0 });
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const fetchProducts = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "24");
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`${API_URL}/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 24, total: 0, totalPages: 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const handleSearch = () => { setSearch(searchInput); };
  const handleSearchKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };
  const clearFilters = () => { setCategory(""); setSearch(""); setSearchInput(""); };

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
  let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-white border-b border-pink-100/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Nuestros Productos</h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 max-w-xl">Encuentra los insumos perfectos para tu proyecto creativo. Explora, busca y descubre.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearchKeyDown} placeholder="Buscar productos..." className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition shadow-sm" />
            <button onClick={handleSearch} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filtros
              {(category || search) && <span className="h-2 w-2 rounded-full bg-rose-500" />}
            </button>
            <p className="text-sm text-gray-400 tabular-nums hidden sm:block">
              {loading ? "Buscando..." : `${pagination.total} producto${pagination.total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className={`lg:block ${mobileFiltersOpen ? "block mb-5" : "hidden"}`}>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <button onClick={clearFilters} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${!category && !search ? "bg-rose-600 text-white shadow-md shadow-rose-200/40" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Todos
              </button>
              {categories.map((item) => (
                <button key={item.id} onClick={() => setCategory(category === item.slug ? "" : item.slug)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${category === item.slug ? "bg-rose-600 text-white shadow-md shadow-rose-200/40" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 sm:p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 mb-5">
              <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sin resultados</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">No encontramos productos con esos filtros. Intenta con otros parámetros.</p>
            <button onClick={clearFilters} className="mt-5 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-700 shadow-lg shadow-rose-200/50 transition-all">Limpiar filtros</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product, idx) => (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${idx * 40}ms` }}>
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt={product.images[0].altText || product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                      )}
                      {product.options.length > 0 && (
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[60%]">
                          {product.options.slice(0, 2).map((opt) => (
                            <span key={opt.id} className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">{opt.name}</span>
                          ))}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-3 sm:p-4">
                      <span className="inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-rose-600">{product.category.name}</span>
                      <h2 className="mt-1.5 text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">{product.name}</h2>
                      <p className="mt-1 text-xs sm:text-sm text-gray-400 line-clamp-1 hidden sm:block">{product.description}</p>
                      <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-rose-500 group-hover:text-rose-600 transition-colors">
                        Ver detalles
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </Link>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <button onClick={(e) => { e.preventDefault(); setModalProduct(product); }} className="w-full rounded-xl border-2 border-rose-200/50 bg-rose-50/50 py-2.5 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200">
                      + Agregar a mi lista
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-1.5 sm:gap-2">
                <button onClick={() => fetchProducts(pagination.page - 1)} disabled={pagination.page <= 1} className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {startPage > 1 && (
                  <>
                    <button onClick={() => fetchProducts(1)} className="hidden sm:block rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">1</button>
                    {startPage > 2 && <span className="text-gray-300 hidden sm:block">...</span>}
                  </>
                )}
                {pageNumbers.map((num) => (
                  <button key={num} onClick={() => fetchProducts(num)} className={`rounded-xl px-3 sm:px-3.5 py-2 text-sm font-medium transition-all shadow-sm ${num === pagination.page ? "bg-rose-600 text-white shadow-rose-200/40" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                    {num}
                  </button>
                ))}
                {endPage < pagination.totalPages && (
                  <>
                    {endPage < pagination.totalPages - 1 && <span className="text-gray-300 hidden sm:block">...</span>}
                    <button onClick={() => fetchProducts(pagination.totalPages)} className="hidden sm:block rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">{pagination.totalPages}</button>
                  </>
                )}
                <button onClick={() => fetchProducts(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalProduct && (
        <AddToListModal product={modalProduct} isOpen={!!modalProduct} onClose={() => setModalProduct(null)} />
      )}
    </div>
  );
}
