'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AddToListModal from '../components/AddToListModal';
import {
  CatalogCategory,
  CatalogTypeOption,
  getTipoOption,
  splitCategories,
} from '../../lib/catalog';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  unit: string;
  category: { id: string; name: string; slug: string; icon: string | null };
  images: { id: string; url: string; altText: string | null }[];
  options: CatalogTypeOption[];
  type?: { id: string; name: string; group: { name: string } } | null;
};
type Pagination = { page: number; limit: number; total: number; totalPages: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const SearchIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

function ProductsCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tree, setTree] = useState<
    (CatalogCategory & {
      groups: { id: string; name: string; types: { id: string; name: string }[] }[];
    })[]
  >([]);
  const [error, setError] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // El estado vive en la URL para que los enlaces del catálogo (por ejemplo el
  // que aparece en las migas de pan de la ficha de producto) funcionen.
  const category = searchParams.get('category') || '';
  const groupId = searchParams.get('groupId') || '';
  const typeId = searchParams.get('typeId') || '';
  const tipo = searchParams.get('tipo') || '';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      if (!('page' in updates)) next.delete('page');
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    fetch(`${API_URL}/api/catalog/tree`)
      .then((res) => res.json())
      .then((data) => {
        setTree(data);
        setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  const { base: baseCategories, extra: extraCategories } = splitCategories(categories);
  const activeCategory = categories.find((c) => c.slug === category);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '24');
      if (category) params.set('category', category);
      if (groupId) params.set('groupId', groupId);
      if (typeId) params.set('typeId', typeId);
      if (search) params.set('search', search);
      if (tipo) {
        params.set('option', 'Tipo');
        params.set('optionValue', tipo);
      }
      const res = await fetch(`${API_URL}/api/products?${params}`);
      if (!res.ok) throw new Error('Le catalogue no está disponible');
      const data = await res.json();
      setError('');
      setProducts(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 24, total: 0, totalPages: 0 });
    } catch {
      setError('No pudimos cargar los productos. Intenta nuevamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, tipo, page, groupId, typeId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Tipos disponibles de la categoría (o de todo el catálogo si no hay una seleccionada).
  useEffect(() => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    let cancelled = false;
    fetch(`${API_URL}/api/products/types${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setTypes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const handleSearch = () => updateParams({ search: searchInput.trim() || null });
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };
  const clearFilters = () =>
    updateParams({ category: null, tipo: null, search: null, groupId: null, typeId: null });
  const selectCategory = (slug: string) =>
    updateParams({
      category: category === slug ? null : slug,
      tipo: null,
      groupId: null,
      typeId: null,
    });
  const selectTipo = (value: string) => updateParams({ tipo: tipo === value ? null : value });

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
  let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const activeFilters = !!(category || search || tipo || groupId || typeId);

  return (
    <div className="min-h-screen">
      {/* Encabezado del catálogo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 border-b border-rose-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Catálogo</p>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
            Nuestros Productos
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 max-w-xl">
            Encuentra los insumos perfectos para tu proyecto creativo. Explora por categoría, filtra
            por tipo y descubre.
          </p>
        </div>
      </div>

      {/* Barra de categorías con iconos (solo las definidas en código) */}
      {baseCategories.length > 0 && (
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4">
              {baseCategories.map((item) => {
                const isActive = category === item.slug;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCategory(item.slug)}
                    aria-pressed={isActive}
                    className="group flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border text-2xl sm:text-3xl shadow-sm transition-all duration-200 group-hover:scale-105 ${isActive ? 'border-rose-500 bg-rose-600 shadow-md shadow-rose-200/60' : 'border-rose-100 bg-rose-50 group-hover:border-rose-300 group-hover:bg-rose-100'}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold uppercase leading-tight tracking-tight text-center line-clamp-2 transition-colors ${isActive ? 'text-rose-600' : 'text-gray-600 group-hover:text-rose-600'}`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}

              {/* Las categorías creadas desde el admin viven en su propia ventana */}
              <Link
                href="/categorias"
                className="group flex flex-col items-center gap-2 cursor-pointer"
              >
                <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-2xl sm:text-3xl shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-rose-300 group-hover:bg-rose-50">
                  🔲
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase leading-tight tracking-tight text-center text-gray-500 group-hover:text-rose-600 transition-colors">
                  Más categorías
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Buscador y filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar productos..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition shadow-sm"
            />
            <button
              onClick={handleSearch}
              aria-label="Buscar"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
            >
              <SearchIcon />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtros
              {activeFilters && <span className="h-2 w-2 rounded-full bg-rose-500" />}
            </button>
            <p className="text-sm text-gray-400 tabular-nums hidden sm:block">
              {loading
                ? 'Buscando...'
                : `${pagination.total} producto${pagination.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className={`lg:block ${mobileFiltersOpen ? 'block mb-5' : 'hidden'}`}>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearFilters}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${!activeFilters ? 'bg-rose-600 text-white shadow-md shadow-rose-200/40' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectCategory(item.slug)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${category === item.slug ? 'bg-rose-600 text-white shadow-md shadow-rose-200/40' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {item.icon && <span aria-hidden="true">{item.icon}</span>}
                  {item.name}
                </button>
              ))}
              {extraCategories.length > 0 && (
                <Link
                  href="/categorias"
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-rose-100 hover:text-rose-600 transition-all"
                >
                  Ver todas las categorías
                </Link>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
            {error}{' '}
            <button onClick={fetchProducts} className="underline">
              Reintentar
            </button>
          </p>
        )}
        {category && (
          <div className="my-5 grid gap-3 sm:grid-cols-2 rounded-2xl border bg-white p-4">
            <label className="text-sm font-semibold">
              Producto
              <select
                className="mt-2 w-full rounded-xl border p-3"
                value={groupId}
                onChange={(e) =>
                  updateParams({ groupId: e.target.value || null, typeId: null, tipo: null })
                }
              >
                <option value="">Todos los productos</option>
                {tree
                  .find((c) => c.slug === category)
                  ?.groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Tipo
              <select
                disabled={!groupId}
                className="mt-2 w-full rounded-xl border p-3 disabled:opacity-40"
                value={typeId}
                onChange={(e) => updateParams({ typeId: e.target.value || null })}
              >
                <option value="">Todos los tipos</option>
                {tree
                  .find((c) => c.slug === category)
                  ?.groups.find((g) => g.id === groupId)
                  ?.types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}
        {/* Tipos: cada categoría tiene sus tipos (ej. en Confección, Cinta → Agua, Doble razo, Floral...) */}
        {types.length > 0 && (
          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <span aria-hidden="true">🏷️</span>
                {activeCategory ? `Tipos de ${activeCategory.name}` : 'Tipos'}
              </h2>
              {tipo && (
                <button
                  onClick={() => updateParams({ tipo: null })}
                  className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
                >
                  Quitar filtro
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map((value) => (
                <button
                  key={value}
                  onClick={() => selectTipo(value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${tipo === value ? 'border-rose-500 bg-rose-500 text-white shadow-sm shadow-rose-200/50' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white overflow-hidden"
              >
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
              <SearchIcon className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sin resultados</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              No encontramos productos con esos filtros. Intenta con otros parámetros.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-700 shadow-lg shadow-rose-200/50 transition-all"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product) => {
                const tipoOption = getTipoOption(product.options);
                const tipoValues = tipoOption ? tipoOption.values.slice(0, 3) : [];
                const otherOptions = product.options.filter((opt) => opt.id !== tipoOption?.id);

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <Link href={`/products/${product.slug}`} className="block p-3 pb-0">
                      <div className="relative aspect-square rounded-xl bg-gray-50 overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.name}
                            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <svg
                              className="w-10 h-10 text-gray-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        {tipoValues.length > 0 && (
                          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                            {tipoValues.map((value) => (
                              <span
                                key={value.id}
                                className="rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm"
                              >
                                {value.value}
                              </span>
                            ))}
                            {(tipoOption?.values.length ?? 0) > tipoValues.length && (
                              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-rose-600 shadow-sm">
                                +{(tipoOption?.values.length ?? 0) - tipoValues.length}
                              </span>
                            )}
                          </div>
                        )}
                        {otherOptions.length > 0 && (
                          <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[50%]">
                            {otherOptions.slice(0, 2).map((opt) => (
                              <span
                                key={opt.id}
                                className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full"
                              >
                                {opt.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-rose-600">
                        {product.category.icon && (
                          <span aria-hidden="true">{product.category.icon}</span>
                        )}
                        {product.category.name}
                      </span>
                      <h2 className="mt-1.5 text-xs sm:text-sm font-semibold text-gray-900 line-clamp-3 leading-snug">
                        <Link
                          href={`/products/${product.slug}`}
                          className="hover:text-rose-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {product.type && `${product.type.group.name} · ${product.type.name}`}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Venta por {product.unit}</p>
                      <div className="mt-auto pt-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setModalProduct(product);
                          }}
                          className="w-full rounded-xl border-2 border-rose-200/50 bg-rose-50/50 py-2.5 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200"
                        >
                          + Agregar a mi lista
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => updateParams({ page: String(pagination.page - 1) })}
                  disabled={pagination.page <= 1}
                  className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {startPage > 1 && (
                  <>
                    <button
                      onClick={() => updateParams({ page: '1' })}
                      className="hidden sm:block rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm"
                    >
                      1
                    </button>
                    {startPage > 2 && <span className="text-gray-300 hidden sm:block">...</span>}
                  </>
                )}
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => updateParams({ page: String(num) })}
                    className={`rounded-xl px-3 sm:px-3.5 py-2 text-sm font-medium transition-all shadow-sm ${num === pagination.page ? 'bg-rose-600 text-white shadow-rose-200/40' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {num}
                  </button>
                ))}
                {endPage < pagination.totalPages && (
                  <>
                    {endPage < pagination.totalPages - 1 && (
                      <span className="text-gray-300 hidden sm:block">...</span>
                    )}
                    <button
                      onClick={() => updateParams({ page: String(pagination.totalPages) })}
                      className="hidden sm:block rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm"
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => updateParams({ page: String(pagination.page + 1) })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-rose-50/40" />}>
      <ProductsCatalog />
    </Suspense>
  );
}
