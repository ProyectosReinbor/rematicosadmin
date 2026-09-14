"use client";

import { FormEvent, useRef, useState } from "react";
import {
  CatalogCategory,
  CatalogProduct,
  ProductStatus,
  createCatalogProduct,
  fullUpdateProduct,
  uploadImages,
  addProductImages,
  deleteProductImage,
  reorderProductImages,
  addProductOption,
  updateProductOption,
  deleteProductOption,
  addOptionValue,
  updateOptionValue,
  deleteOptionValue,
} from "../../lib/api";
import ImageCarousel from "./ImageCarousel";

interface ProductFormProps {
  categories: CatalogCategory[];
  product?: CatalogProduct;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProductForm({ categories, product, onSaved, onCancel }: ProductFormProps) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [details, setDetails] = useState(product?.details || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [status, setStatus] = useState<ProductStatus>(product?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [images, setImages] = useState<{ id: string; url: string; altText: string | null }[]>(product?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [options, setOptions] = useState<{ id?: string; name: string; values: { id?: string; value: string; imageUrl: string | null }[] }[]>(
    product?.options.map((o) => ({ id: o.id, name: o.name, values: o.values.map((v) => ({ id: v.id, value: v.value, imageUrl: v.imageUrl })) })) || []
  );
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionImageRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ─── Image handling ──────────────────────────────
  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (idx: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx); });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = async (imageId: string) => {
    if (!product) return;
    try {
      await deleteProductImage(product.id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) { setError(err instanceof Error ? err.message : "Error al eliminar imagen"); }
  };

  const handleReorderImages = async (imageIds: string[]) => {
    if (!product) return;
    try {
      const updated = await reorderProductImages(product.id, imageIds);
      setImages(updated.images);
    } catch (err) { setError(err instanceof Error ? err.message : "Error al reordenar"); }
  };

  // ─── Option handling ─────────────────────────────
  const addOption = () => {
    if (!newOptionName.trim() || !newOptionValues.trim()) return;
    const vals = newOptionValues.split(",").map((v) => v.trim()).filter(Boolean).map((v) => ({ value: v, imageUrl: null as string | null }));
    setOptions((prev) => [...prev, { name: newOptionName.trim(), values: vals }]);
    setNewOptionName("");
    setNewOptionValues("");
  };

  const removeOption = async (idx: number) => {
    const opt = options[idx];
    if (opt.id && product) {
      try { await deleteProductOption(product.id, opt.id); } catch (err) { setError(err instanceof Error ? err.message : "Error"); return; }
    }
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addValueToOption = (optIdx: number) => {
    setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: [...o.values, { value: "", imageUrl: null }] } : o));
  };

  const updateOptionValue = (optIdx: number, valIdx: number, newValue: string) => {
    setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: o.values.map((v, j) => j === valIdx ? { ...v, value: newValue } : v) } : o));
  };

  const removeValueFromOption = (optIdx: number, valIdx: number) => {
    setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: o.values.filter((_, j) => j !== valIdx) } : o));
  };

  const handleOptionImageUpload = async (optIdx: number, valIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    try {
      const [uploaded] = await uploadImages([file], options[optIdx].values[valIdx].value);
      const opt = options[optIdx];
      const val = opt.values[valIdx];
      if (val.id) {
        await updateOptionValue(product.id, opt.id!, val.id, { imageUrl: uploaded.url });
      }
      setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: o.values.map((v, j) => j === valIdx ? { ...v, imageUrl: uploaded.url } : v) } : o));
    } catch (err) { setError(err instanceof Error ? err.message : "Error al subir imagen"); }
  };

  // ─── Save ────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setUploading(true);
    try {
      if (isEdit && product) {
        // Update basic fields
        await fullUpdateProduct(product.id, { name, description, details: details || null, categoryId, status, isFeatured });

        // Upload new images
        if (newImageFiles.length > 0) {
          const uploaded = await uploadImages(newImageFiles, name);
          await addProductImages(product.id, uploaded.map((img) => ({ url: img.url, altText: name })));
        }

        // Sync options
        for (const opt of options) {
          if (opt.id) {
            await updateProductOption(product.id, opt.id, { name: opt.name });
            // Sync values
            for (const val of opt.values) {
              if (val.id) {
                await updateOptionValue(product.id, opt.id, val.id, { value: val.value, imageUrl: val.imageUrl });
              } else if (val.value) {
                await addOptionValue(product.id, opt.id, { value: val.value, imageUrl: val.imageUrl || undefined });
              }
            }
          } else if (opt.name && opt.values.length > 0) {
            const validValues = opt.values.filter((v) => v.value);
            if (validValues.length > 0) {
              await addProductOption(product.id, { name: opt.name, values: validValues.map((v) => ({ value: v.value, imageUrl: v.imageUrl || undefined })) });
            }
          }
        }

        setSuccess("Producto actualizado correctamente");
      } else {
        // Create
        let imagesPayload: { url: string; altText?: string }[] | undefined;
        if (newImageFiles.length > 0) {
          const uploaded = await uploadImages(newImageFiles, name);
          imagesPayload = uploaded.map((img) => ({ url: img.url, altText: name }));
        }
        await createCatalogProduct({
          name, description, details: details || undefined, categoryId, status, isFeatured,
          images: imagesPayload,
          options: options.filter((o) => o.name && o.values.length > 0).map((o) => ({
            name: o.name,
            values: o.values.filter((v) => v.value).map((v) => ({ value: v.value, imageUrl: v.imageUrl || undefined })),
          })),
        });
        setSuccess("Producto creado correctamente");
      }
      setTimeout(() => onSaved(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isEdit ? "Editar producto" : "Nuevo producto"}</h2>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{success}</p>}

      {/* Básicos */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Nombre
          <input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="text-sm">
          Categoría
          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="md:col-span-2 text-sm">
          Descripción
          <textarea required minLength={20} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-24 w-full rounded border px-3 py-2" />
        </label>
        <label className="md:col-span-2 text-sm">
          Detalles
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="mt-1 min-h-20 w-full rounded border px-3 py-2" />
        </label>
        <label className="text-sm">
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="mt-1 w-full rounded border px-3 py-2">
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="UNAVAILABLE">No disponible</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
          Destacado
        </label>
      </div>

      {/* Carrusel de imágenes existentes */}
      {isEdit && images.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Imágenes del producto (arrastra para reordenar)</h3>
          <ImageCarousel images={images} editable onRemove={removeExistingImage} onReorder={handleReorderImages} />
        </div>
      )}

      {/* Subir nuevas imágenes */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          {isEdit ? "Agregar más imágenes" : "Imágenes del producto"}
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleNewImages} className="mt-1 w-full rounded border px-3 py-2" />
          <span className="text-xs text-gray-500"> JPG, PNG, WebP. Máximo 12.</span>
        </label>
        {newImagePreviews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {newImagePreviews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Nueva ${i + 1}`} className="h-20 w-20 rounded border object-cover" />
                <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atributos */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Atributos</h3>
        {options.map((opt, optIdx) => (
          <div key={optIdx} className="mb-3 rounded border p-3">
            <div className="flex items-center gap-2 mb-2">
              <input value={opt.name} onChange={(e) => setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, name: e.target.value } : o))} className="rounded border px-2 py-1 text-sm font-medium" placeholder="Nombre del atributo" />
              <button type="button" onClick={() => removeOption(optIdx)} className="text-xs text-red-500 hover:text-red-700">Eliminar atributo</button>
            </div>
            <div className="space-y-2">
              {opt.values.map((val, valIdx) => (
                <div key={valIdx} className="flex items-center gap-2">
                  <input value={val.value} onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)} className="rounded border px-2 py-1 text-sm" placeholder="Valor" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                    📷 Imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { optionImageRefs.current[`${optIdx}-${valIdx}`] = el; }}
                      onChange={(e) => handleOptionImageUpload(optIdx, valIdx, e)}
                    />
                    <button type="button" onClick={() => optionImageRefs.current[`${optIdx}-${valIdx}`]?.click()} className="rounded bg-gray-100 px-2 py-0.5 text-xs hover:bg-gray-200">
                      {val.imageUrl ? "Cambiar" : "Subir"}
                    </button>
                  </label>
                  {val.imageUrl && <img src={val.imageUrl} alt="" className="h-8 w-8 rounded border object-cover" />}
                  <button type="button" onClick={() => removeValueFromOption(optIdx, valIdx)} className="text-xs text-red-400 hover:text-red-600">×</button>
                </div>
              ))}
              <button type="button" onClick={() => addValueToOption(optIdx)} className="text-xs text-blue-600 hover:text-blue-800">+ Agregar valor</button>
            </div>
          </div>
        ))}

        {/* Nuevo atributo rápido */}
        <div className="flex gap-2 mt-2">
          <input value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} placeholder="Nuevo atributo (ej: Color)" className="rounded border px-2 py-1 text-sm" />
          <input value={newOptionValues} onChange={(e) => setNewOptionValues(e.target.value)} placeholder="Valores: Rojo, Azul, Verde" className="flex-1 rounded border px-2 py-1 text-sm" />
          <button type="button" onClick={addOption} className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">Agregar</button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={uploading} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50">
          {uploading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
