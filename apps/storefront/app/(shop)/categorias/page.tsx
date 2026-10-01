"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CatalogCategory, splitCategories } from "../../lib/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const { base, extra } = useMemo(() => splitCategories(categories), [categories]);

  const matches = (category: CatalogCategory) =>
    !query.trim() || category.name.toLowerCase().includes(query.trim().toLowerCase());

  const visibleBase = base.filter(matches);
  const visibleExtra = extra.filter(matches);
  const noneAtAll = visibleBase.length === 0 && visibleExtra.length === 0;

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 border-b border-rose-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <nav className="text-xs text-gray-400">
            <Link href="/products" className="hover:text-rose-600 transition-colors">Catálogo</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-600 font-medium">Categorías</span>
          </nav>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">Todas las categorías</h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 max-w-xl">
            Las primeras son las categorías principales del catálogo; el resto son las que se han ido creando desde el panel de administración.
          </p>

          <div className="relative mt-5 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar categoría..." className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition shadow-sm" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="h-12 w-12 rounded-full bg-gray-100" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : noneAtAll ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 mb-5">
              <SearchIcon className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sin resultados</h2>
            <p className="mt-1 text-sm text-gray-500">No encontramos categorías con ese nombre.</p>
          </div>
        ) : (
          <>
            {visibleBase.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Categorías principales</h2>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">{visibleBase.length}</span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {visibleBase.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </section>
            )}

            {visibleExtra.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Más categorías</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{visibleExtra.length}</span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {visibleExtra.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: CatalogCategory }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-xl transition-all group-hover:border-rose-300 group-hover:bg-rose-100">
        {category.icon || "🔲"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">{category.name}</span>
        {category.description && (
          <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-gray-400">{category.description}</span>
        )}
      </span>
      <svg className="w-4 h-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </Link>
  );
}
