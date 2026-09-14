"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  name: string; description: string; details: string | null; category: { name: string };
  images: { id: string; url: string; altText: string | null }[];
  options: { id: string; name: string; values: { id: string; value: string }[] }[];
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  useEffect(() => { fetch(`${API_URL}/api/products/${params.slug}`).then(async (res) => { if (!res.ok) throw new Error("not-found"); return res.json(); }).then((data) => { setProduct(data); setSelection(Object.fromEntries(data.options.map((option: Product["options"][number]) => [option.name, option.values[0]?.value || ""]))); }).catch(() => setNotFound(true)); }, [params.slug]);
  if (notFound) return <main className="mx-auto max-w-4xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Producto no disponible</h1><Link href="/products" className="mt-4 inline-block text-[var(--color-primary)]">Volver al catálogo</Link></main>;
  if (!product) return <main className="mx-auto max-w-4xl px-4 py-20 text-gray-500">Cargando producto…</main>;
  const selectedOptions = Object.entries(selection).map(([name, value]) => `${name}: ${value}`).join(", ");
  const message = `Hola, me interesa: ${product.name}${selectedOptions ? `. Opciones: ${selectedOptions}` : ""}`;
  return <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 sm:px-6 lg:px-8"><section><div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">{product.images[selectedImage] ? <img src={product.images[selectedImage].url} alt={product.images[selectedImage].altText || product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">Sin imagen disponible</div>}</div>{product.images.length > 1 && <div className="mt-3 flex gap-3 overflow-auto">{product.images.map((image, index) => <button key={image.id} onClick={() => setSelectedImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${index === selectedImage ? "border-[var(--color-primary)]" : "border-transparent"}`}><img src={image.url} alt={image.altText || `${product.name} ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}</section><section><Link href="/products" className="text-sm text-[var(--color-primary)]">← Volver al catálogo</Link><p className="mt-5 text-sm text-gray-500">{product.category.name}</p><h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1><p className="mt-5 leading-relaxed text-gray-600">{product.description}</p>{product.details && <div className="mt-6 rounded-xl bg-gray-50 p-4"><h2 className="font-semibold text-gray-900">Detalles</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">{product.details}</p></div>}<div className="mt-7 space-y-5">{product.options.map((option) => <fieldset key={option.id}><legend className="mb-2 text-sm font-semibold text-gray-800">{option.name}</legend><div className="flex flex-wrap gap-2">{option.values.map((value) => <button key={value.id} onClick={() => setSelection((current) => ({ ...current, [option.name]: value.value }))} className={`rounded-full border px-4 py-2 text-sm ${selection[option.name] === value.value ? "border-[var(--color-primary)] bg-pink-50 text-[var(--color-primary)]" : "border-gray-300 text-gray-700"}`}>{value.value}</button>)}</div></fieldset>)}</div><a href={`https://wa.me/573001234567?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="mt-8 block rounded-full bg-[var(--color-primary)] px-5 py-3 text-center font-medium text-white">Consultar disponibilidad</a></section></main>;
}
