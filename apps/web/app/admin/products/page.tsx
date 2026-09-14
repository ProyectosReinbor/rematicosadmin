"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  CatalogCategory,
  CatalogProduct,
  ProductStatus,
  createCatalogCategory,
  deleteProduct,
  fetchAdminProducts,
  fetchCatalogCategories,
  updateCatalogProduct,
  uploadImages,
  addProductImages,
} from "../../lib/api";
import ProductForm from "../components/ProductForm";
import ImageCarousel from "../components/ImageCarousel";

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [mode, setMode] = useState<"list" | "create" | { type: "edit"; product: CatalogProduct }>("list");
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const [addImageProductId, setAddImageProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [productData, categoryData] = await Promise.all([fetchAdminProducts(), fetchCatalogCategories()]);
      setProducts(productData.data);
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      const category = await createCatalogCategory(categoryName.trim());
      setCategories((current) => [...current, category]);
      setCategoryName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible crear la categoría");
    }
  };

  const changeStatus = async (product: CatalogProduct, status: ProductStatus) => {
    try {
      await updateCatalogProduct(product.id, { status });
      load();
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
      load();
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
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible eliminar el producto");
    }
  };

  // ─── Edit / Create mode ─────────────────────────
  if (mode === "create" || (typeof mode === "object" && mode.type === "edit")) {
    const editProduct = typeof mode === "object" ? mode.product : undefined;
    return (
      <main className="space-y-6 max-w-6xl">
        <ProductForm
          categories={categories}
          product={editProduct}
          onSaved={() => { setMode("list"); load(); }}
          onCancel={() => setMode("list")}
        />
      </main>
    );
  }

  // ─── List mode ──────────────────────────────────
  return (
    <main className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Catálogo público sin precios.</p>
        </div>
        <button onClick={() => setMode("create")} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Nuevo producto
        </button>
      </div>

      {/* Categorías */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Categorías existentes</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400">No hay categorías creadas aún.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat.id} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{cat.name}</span>
            ))}
          </div>
        )}
        <form onSubmit={createCategory} className="mt-3 flex gap-2">
          <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nueva categoría" className="flex-1 rounded border px-3 py-2" />
          <button className="rounded border px-4 py-2 text-sm">Agregar</button>
        </form>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Lista de productos */}
      <section className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Cargando productos…</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">Aún no hay productos. Crea el primero para comenzar el catálogo.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start gap-4">
                {/* Mini carrusel */}
                <div className="w-48 flex-shrink-0">
                  <ImageCarousel images={product.images} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.category.name} · {product.images.length} imagen(es) · {product.options.length} atributo(s)
                      </p>
                      <p className="mt-1 text-sm text-gray-400 line-clamp-2">{product.description}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs">
                      {product.status === "DRAFT" ? "Borrador" : product.status === "PUBLISHED" ? "Publicado" : product.status === "ARCHIVED" ? "Archivado" : "No disponible"}
                    </span>
                  </div>

                  {/* Opciones */}
                  {product.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.options.map((opt) => (
                        <div key={opt.id} className="rounded bg-gray-50 px-2 py-1 text-xs">
                          <span className="font-medium">{opt.name}:</span>{" "}
                          {opt.values.map((v) => (
                            <span key={v.id} className="inline-flex items-center gap-1">
                              {v.imageUrl && <img src={v.imageUrl} alt="" className="h-4 w-4 rounded object-cover" />}
                              {v.value}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setMode({ type: "edit", product })} className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">Editar</button>
                    <button onClick={() => changeStatus(product, product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")} className="rounded bg-gray-50 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">
                      {product.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                    </button>
                    <button onClick={() => setAddImageProductId(product.id)} className="rounded bg-gray-50 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">+ Imágenes</button>
                    <button onClick={() => handleDelete(product)} className="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <input ref={addImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
    </main>
  );
}
