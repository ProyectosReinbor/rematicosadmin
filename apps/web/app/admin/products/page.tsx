"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  CatalogCategory,
  CatalogProduct,
  ProductStatus,
  ProductPagination,
  createCatalogCategory,
  deleteProduct,
  fetchAdminProducts,
  fetchCatalogCategories,
  updateCatalogCategory,
  updateCatalogProduct,
  uploadImages,
  addProductImages,
} from "../../lib/api";
import ProductForm from "../components/ProductForm";
import ImageCarousel from "../components/ImageCarousel";

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [mode, setMode] = useState<"list" | "create" | { type: "edit"; product: CatalogProduct }>("list");
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const [addImageProductId, setAddImageProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<{ total: number; published: number; draft: number } | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const load = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const [productData, categoryData] = await Promise.all([
        fetchAdminProducts({ page, limit: 20, search, category: filterCategory, status: filterStatus }),
        fetchCatalogCategories(),
      ]);
      setProducts(productData.data);
      setPagination(productData.pagination);
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus]);

  useEffect(() => { load(1); }, [load]);

  const createCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim() || categorySaving) return;
    setCategorySaving(true);
    setCategoryError("");
    try {
      const category = await createCatalogCategory(categoryName.trim());
      setCategories((current) => [...current, category]);
      setCategoryName("");
      setShowNewCategory(false);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "No fue posible crear la categoría");
    } finally {
      setCategorySaving(false);
    }
  };

  const startEditCategory = (cat: CatalogCategory) => {
    setCategoryError("");
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const saveCategory = async () => {
    if (!editingCategoryId || !editingCategoryName.trim() || categorySaving) return;
    setCategorySaving(true);
    setCategoryError("");
    try {
      const updated = await updateCatalogCategory(editingCategoryId, editingCategoryName.trim());
      setCategories((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      setProducts((current) => current.map((p) => (p.category.id === updated.id ? { ...p, category: { ...p.category, name: updated.name } } : p)));
      setEditingCategoryId(null);
      setEditingCategoryName("");
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "No fue posible actualizar la categoría");
    } finally {
      setCategorySaving(false);
    }
  };

  const changeStatus = async (product: CatalogProduct, status: ProductStatus) => {
    try {
      await updateCatalogProduct(product.id, { status });
      load(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar el producto");
    }
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !addImageProductId) return;
    setUploading(true);
    try {
      const product = products.find((p) => p.id === addImageProductId);
      const uploaded = await uploadImages(files, product?.name || "imagen");
      await addProductImages(addImageProductId, uploaded.map((img) => ({ url: img.url, altText: product?.name || "imagen" })));
      load(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible agregar las imágenes");
    } finally {
      setUploading(false);
      setAddImageProductId(null);
      if (addImageInputRef.current) addImageInputRef.current.value = "";
    }
  };

  const handleDelete = async (product: CatalogProduct) => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(product.id);
      load(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible eliminar el producto");
    }
  };

  const handleSearch = () => { setSearch(searchInput); };
  const handleSearchKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  const statusBadge = (status: ProductStatus) => {
    const isPublished = status === "PUBLISHED";
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
        {isPublished ? "Publicado" : "Oculto"}
      </span>
    );
  };

  if (mode === "create" || (typeof mode === "object" && mode.type === "edit")) {
    const editProduct = typeof mode === "object" ? mode.product : undefined;
    return (
      <main className="space-y-6 max-w-6xl">
        <ProductForm categories={categories} product={editProduct} onSaved={() => { setMode("list"); load(1); }} onCancel={() => setMode("list")} />
      </main>
    );
  }

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
  let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <main className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">{pagination.total} producto{pagination.total !== 1 ? "s" : ""} en total</p>
        </div>
        <button onClick={() => setMode("create")} className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all">
          + Nuevo producto
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearchKeyDown} placeholder="Buscar productos..." className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none">
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none">
            <option value="">Todos los estados</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="UNAVAILABLE">Ocultos</option>
          </select>
          <button onClick={handleSearch} className="rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 transition whitespace-nowrap">Buscar</button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Categorías</h2>
          {!showNewCategory && (
            <button type="button" onClick={() => { setShowNewCategory(true); setCategoryError(""); }} className="rounded-xl bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition whitespace-nowrap">
              + Nueva categoría
            </button>
          )}
        </div>

        {showNewCategory && (
          <form onSubmit={createCategory} className="mb-4 space-y-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3 sm:p-4">
            <p className="text-xs font-semibold text-gray-700">Nueva categoría</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input autoFocus value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nombre" className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowNewCategory(false); setCategoryName(""); setCategoryError(""); }} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" disabled={categorySaving} className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/50 hover:shadow-lg disabled:opacity-50 transition-all whitespace-nowrap">
                  {categorySaving ? "Creando..." : "Crear categoría"}
                </button>
              </div>
            </div>
          </form>
        )}

        {categoryError && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {categoryError}
            <button onClick={() => setCategoryError("")} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {categories.length === 0 ? (
          <p className="text-sm text-gray-400">No hay categorías creadas aún.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => editingCategoryId === cat.id ? (
              <div key={cat.id} className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <p className="text-xs font-semibold text-gray-700">Editar categoría</p>
                <label className="block text-xs font-medium text-gray-600">
                  Nombre
                  <input
                    autoFocus
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveCategory(); } if (e.key === "Escape") { setEditingCategoryId(null); setEditingCategoryName(""); } }}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setEditingCategoryId(null); setEditingCategoryName(""); }} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                  <button type="button" onClick={saveCategory} disabled={categorySaving} className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200/50 hover:shadow-lg disabled:opacity-50 transition-all">
                    {categorySaving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            ) : (
              <div key={cat.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5">
                <span className="truncate text-sm font-medium text-gray-700">{cat.name}</span>
                <button type="button" onClick={() => startEditCategory(cat)} className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-center gap-2"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}<button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">×</button></div>}

      <section className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 flex gap-4">
                <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-gray-100 bg-white">
            <svg className="mx-auto w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p className="text-gray-500 font-medium">No se encontraron productos</p>
            <p className="text-sm text-gray-400 mt-1">Crea el primero para comenzar el catálogo</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-40 flex-shrink-0">
                  <ImageCarousel images={product.images} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                        {statusBadge(product.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {product.category.name} · {product.images.length} imagen(es) · {product.options.length} atributo(s)
                      </p>
                    </div>
                  </div>

                  {product.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {product.options.map((opt) => (
                        <span key={opt.id} className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-1 text-xs">
                          <span className="font-medium text-gray-700">{opt.name}:</span>{" "}
                          <span className="text-gray-500">{opt.values.map((v) => v.value).join(", ")}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setMode({ type: "edit", product })} className="rounded-xl bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition">Editar</button>
                    <button onClick={() => changeStatus(product, product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")} className="rounded-xl bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition">
                      {product.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                    </button>
                    <button onClick={() => setAddImageProductId(product.id)} className="rounded-xl bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition">+ Imágenes</button>
                    <button onClick={() => handleDelete(product)} className="rounded-xl bg-red-50 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          {pageNumbers.map((num) => (
            <button key={num} onClick={() => load(num)} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${num === pagination.page ? "bg-rose-600 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              {num}
            </button>
          ))}
          <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      <input ref={addImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
    </main>
  );
}
