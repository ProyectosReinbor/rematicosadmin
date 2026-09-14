"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  CatalogCategory,
  CatalogProduct,
  ProductStatus,
  addProductImages,
  addProductOption,
  addProductVariant,
  createCatalogCategory,
  createCatalogProduct,
  fetchAdminProducts,
  fetchCatalogCategories,
  updateCatalogProduct,
  uploadImages,
} from "../../lib/api";

const initialForm = {
  name: "",
  description: "",
  details: "",
  categoryId: "",
  status: "DRAFT" as ProductStatus,
  optionName: "",
  optionValues: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const [addImageProductId, setAddImageProductId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [productData, categoryData] = await Promise.all([
        fetchAdminProducts(),
        fetchCatalogCategories(),
      ]);
      setProducts(productData.data);
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateForm = (key: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setUploading(true);
    try {
      let images: { url: string; altText?: string }[] | undefined;
      if (imageFiles.length > 0) {
        const uploaded = await uploadImages(imageFiles, form.name);
        images = uploaded.map((img) => ({ url: img.url, altText: form.name }));
      }
      await createCatalogProduct({
        name: form.name,
        description: form.description,
        details: form.details || undefined,
        categoryId: form.categoryId,
        status: form.status,
        images,
        options:
          form.optionName && form.optionValues
            ? [
                {
                  name: form.optionName,
                  values: form.optionValues
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                },
              ]
            : undefined,
      });
      setForm(initialForm);
      setShowForm(false);
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible guardar el producto");
    } finally {
      setUploading(false);
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
      await addProductImages(
        addImageProductId,
        uploaded.map((img) => ({ url: img.url, altText: product?.name || "imagen" }))
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible agregar las imágenes");
    } finally {
      setUploading(false);
      setAddImageProductId(null);
      if (addImageInputRef.current) addImageInputRef.current.value = "";
    }
  };

  const addOption = async (product: CatalogProduct) => {
    const name = prompt("Nombre del atributo (por ejemplo, Color):");
    if (!name) return;
    const rawValues = prompt("Valores separados por coma (por ejemplo, Rojo, Azul):");
    if (!rawValues) return;
    try {
      await addProductOption(product.id, {
        name,
        values: rawValues
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible agregar el atributo");
    }
  };

  const addVariant = async (product: CatalogProduct) => {
    const reference = prompt("Referencia interna opcional:") || undefined;
    const rawAttributes = prompt("Atributos como Color=Rojo, Tamaño=Grande:");
    if (!rawAttributes) return;
    const attributes = rawAttributes
      .split(",")
      .reduce<Record<string, string>>((result, item) => {
        const [key, value] = item.split("=").map((part) => part.trim());
        if (key && value) result[key] = value;
        return result;
      }, {});
    try {
      await addProductVariant(product.id, { reference, attributes });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible agregar la variante");
    }
  };

  return (
    <main className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Catálogo público sin precios.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {showForm ? "Cerrar" : "Nuevo producto"}
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
              <span
                key={cat.id}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <form onSubmit={createCategory} className="mt-3 flex gap-2">
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Nueva categoría, por ejemplo Bisutería"
            className="flex-1 rounded border px-3 py-2"
          />
          <button className="rounded border px-4 py-2 text-sm">Agregar</button>
        </form>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Formulario nuevo producto */}
      {showForm && (
        <form
          onSubmit={createProduct}
          className="grid gap-4 rounded-lg border bg-white p-6 md:grid-cols-2"
        >
          <h2 className="md:col-span-2 text-xl font-semibold">Nuevo producto</h2>

          <label className="text-sm">
            Nombre
            <input
              required
              minLength={3}
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Categoría
            <select
              required
              value={form.categoryId}
              onChange={(e) => updateForm("categoryId", e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 text-sm">
            Descripción atractiva
            <textarea
              required
              minLength={20}
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className="mt-1 min-h-24 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="md:col-span-2 text-sm">
            Detalles, materiales o recomendaciones
            <textarea
              value={form.details}
              onChange={(e) => updateForm("details", e.target.value)}
              className="mt-1 min-h-20 w-full rounded border px-3 py-2"
            />
          </label>

          <div className="md:col-span-2">
            <label className="text-sm">
              Imágenes del producto
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-1 w-full rounded border px-3 py-2"
              />
              <span className="text-xs text-gray-500">
                Selecciona uno o varios archivos (JPG, PNG, WebP). Máximo 12.
              </span>
            </label>
            {imagePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={`Preview ${i + 1}`} className="h-20 w-20 rounded border object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="text-sm">
            Estado
            <select
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="UNAVAILABLE">No disponible</option>
            </select>
          </label>

          <label className="text-sm">
            Atributo opcional
            <input
              value={form.optionName}
              onChange={(e) => updateForm("optionName", e.target.value)}
              placeholder="Color, Tamaño..."
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          {form.optionName && (
            <label className="text-sm">
              Valores del atributo
              <input
                value={form.optionValues}
                onChange={(e) => updateForm("optionValues", e.target.value)}
                placeholder="Rojo, Azul, Verde..."
                className="mt-1 w-full rounded border px-3 py-2"
              />
              <span className="text-xs text-gray-500">Separados por coma.</span>
            </label>
          )}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : "Crear producto"}
            </button>
          </div>
        </form>
      )}

      {/* Lista de productos */}
      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b px-5 py-3 text-sm font-medium text-gray-500">
          <span>Producto</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {loading ? (
          <p className="p-5 text-gray-500">Cargando productos…</p>
        ) : products.length === 0 ? (
          <p className="p-5 text-gray-500">
            Aún no hay productos. Crea el primero para comenzar el catálogo.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b px-5 py-4 last:border-0"
            >
              <div className="flex items-center gap-3">
                {product.images[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    className="h-12 w-12 rounded border object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.category.name} · {product.images.length} imagen(es) ·{" "}
                    {product.options.length} atributo(s)
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                {product.status === "DRAFT"
                  ? "Borrador"
                  : product.status === "PUBLISHED"
                    ? "Publicado"
                    : "No disponible"}
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() =>
                    changeStatus(
                      product,
                      product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
                    )
                  }
                  className="text-sm text-blue-700"
                >
                  {product.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                </button>
                <button
                  onClick={() => setAddImageProductId(product.id)}
                  className="text-sm text-blue-700"
                >
                  Imágenes
                </button>
                <button onClick={() => addOption(product)} className="text-sm text-blue-700">
                  Atributo
                </button>
                <button onClick={() => addVariant(product)} className="text-sm text-blue-700">
                  Variante
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Input oculto para agregar imágenes a producto existente */}
      <input
        ref={addImageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddImages}
      />
    </main>
  );
}
