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

const UNIT_OPTIONS = [
  { value: "UNIDAD", label: "Unidad" },
  { value: "DOCENA", label: "Docena" },
  { value: "PAR", label: "Par" },
  { value: "JUEGO", label: "Juego" },
  { value: "LIBRA", label: "Libra" },
  { value: "KILOGRAMO", label: "Kilogramo" },
  { value: "METRO", label: "Metro" },
  { value: "METRO_CUADRADO", label: "Metro cuadrado" },
  { value: "METRO_LINEAL", label: "Metro lineal" },
  { value: "ROLLO", label: "Rollo" },
  { value: "CAJA", label: "Caja" },
  { value: "PAQUETE_100", label: "Paquete de 100" },
  { value: "PAQUETE_250", label: "Paquete de 250" },
  { value: "PAQUETE_500", label: "Paquete de 500" },
  { value: "PAQUETE_1000", label: "Paquete de 1000" },
];

export default function ProductForm({ categories, product, onSaved, onCancel }: ProductFormProps) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [details, setDetails] = useState(product?.details || "");
  const [unit, setUnit] = useState(product?.unit || "UNIDAD");
  const [categoryId, setCategoryId] = useState(product?.category?.id || "");
  const [status, setStatus] = useState<ProductStatus>(product?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [images, setImages] = useState<{ id: string; url: string; altText: string | null }[]>(product?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [options, setOptions] = useState<{ id?: string; name: string; values: { id?: string; value: string }[] }[]>(
    product?.options.map((o) => ({ id: o.id, name: o.name, values: o.values.map((v) => ({ id: v.id, value: v.value })) })) || []
  );
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 12 - images.length);
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

  const addOption = () => {
    if (!newOptionName.trim() || !newOptionValues.trim()) return;
    const vals = newOptionValues.split(",").map((v) => v.trim()).filter(Boolean).map((v) => ({ value: v }));
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
    setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: [...o.values, { value: "" }] } : o));
  };

  const updateLocalOptionValue = (optIdx: number, valIdx: number, newValue: string) => {
    setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: o.values.map((v, j) => j === valIdx ? { ...v, value: newValue } : v) } : o));
  };

  const removeValueFromOption = (optIdx: number, valIdx: number) => {
    setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, values: o.values.filter((_, j) => j !== valIdx) } : o));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setUploading(true);
    try {
      if (isEdit && product) {
        await fullUpdateProduct(product.id, { name, description, details: details || null, unit, categoryId, status, isFeatured });

        if (newImageFiles.length > 0) {
          const uploaded = await uploadImages(newImageFiles, name);
          await addProductImages(product.id, uploaded.map((img) => ({ url: img.url, altText: name })));
        }

        for (const opt of options) {
          if (opt.id) {
            await updateProductOption(product.id, opt.id, { name: opt.name });
            for (const val of opt.values) {
              if (val.id) {
                await updateOptionValue(product.id, opt.id, val.id, { value: val.value });
              } else if (val.value) {
                await addOptionValue(product.id, opt.id, { value: val.value });
              }
            }
          } else if (opt.name && opt.values.length > 0) {
            const validValues = opt.values.filter((v) => v.value);
            if (validValues.length > 0) {
              await addProductOption(product.id, { name: opt.name, values: validValues.map((v) => ({ value: v.value })) });
            }
          }
        }

        setSuccess("Producto actualizado correctamente");
      } else {
        let imagesPayload: { url: string; altText?: string }[] | undefined;
        if (newImageFiles.length > 0) {
          const uploaded = await uploadImages(newImageFiles, name);
          imagesPayload = uploaded.map((img) => ({ url: img.url, altText: name }));
        }
        await createCatalogProduct({
          name, description, details: details || undefined, unit, categoryId, status, isFeatured,
          images: imagesPayload,
          options: options.filter((o) => o.name && o.values.length > 0).map((o) => ({
            name: o.name,
            values: o.values.filter((v) => v.value).map((v) => ({ value: v.value })),
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{isEdit ? "Editar producto" : "Nuevo producto"}</h2>
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-center gap-2"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}
      {success && <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 flex items-center gap-2"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{success}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
          Nombre del producto
          <input required minLength={3} maxLength={160} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Guirnalda de flores" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition" />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Categoría
          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition appearance-none">
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Unidad de venta
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition appearance-none">
            {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
          Descripción
          <textarea required minLength={20} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe el producto para tus clientes..." className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none" />
        </label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
          Detalles adicionales
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder="Información técnica, materiales, etc." className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none" />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition appearance-none">
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="UNAVAILABLE">No disponible</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <input type="checkbox" id="featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">Producto destacado</label>
        </div>
      </div>

      {isEdit && images.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Imágenes del producto</h3>
          <ImageCarousel images={images} editable onRemove={removeExistingImage} onReorder={handleReorderImages} />
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          {isEdit ? "Agregar más imágenes" : "Imágenes del producto"}
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 sm:p-8 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-all"
        >
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-sm font-medium text-gray-600">Haz clic para subir imágenes</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP. Máximo {12 - images.length} más.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
        {newImagePreviews.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {newImagePreviews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Nueva ${i + 1}`} className="h-20 w-20 rounded-xl border object-cover" />
                <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Atributos</h3>
        <p className="text-xs text-gray-400 mb-3">Ej: Color (Rojo, Azul, Dorado), Tamaño (Pequeño, Mediano, Grande)</p>
        {options.map((opt, optIdx) => (
          <div key={optIdx} className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <input value={opt.name} onChange={(e) => setOptions((prev) => prev.map((o, i) => i === optIdx ? { ...o, name: e.target.value } : o))} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="Nombre del atributo" />
              <button type="button" onClick={() => removeOption(optIdx)} className="rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition">Eliminar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val, valIdx) => (
                <div key={valIdx} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1">
                  <input value={val.value} onChange={(e) => updateLocalOptionValue(optIdx, valIdx, e.target.value)} className="w-24 sm:w-32 bg-transparent px-1 py-0.5 text-sm focus:outline-none" placeholder="Valor" />
                  <button type="button" onClick={() => removeValueFromOption(optIdx, valIdx)} className="text-gray-400 hover:text-red-500 transition p-0.5">×</button>
                </div>
              ))}
              <button type="button" onClick={() => addValueToOption(optIdx)} className="rounded-lg border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-500 hover:border-rose-300 hover:text-rose-600 transition">+ valor</button>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} placeholder="Atributo (ej: Color)" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
          <input value={newOptionValues} onChange={(e) => setNewOptionValues(e.target.value)} placeholder="Valores separados por coma" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())} />
          <button type="button" onClick={addOption} className="rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 transition whitespace-nowrap">Agregar</button>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
        <button type="submit" disabled={uploading} className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/60 disabled:opacity-50 transition-all">
          {uploading ? (
            <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</span>
          ) : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
