"use client";

import Link from "next/link";
import { useEffect, useState, use, useRef } from "react";
import AddToListModal from "../../components/AddToListModal";

type ProductImage = { id: string; url: string; altText: string | null };
type OptionValue = { id: string; value: string; imageUrl: string | null };
type ProductOption = { id: string; name: string; values: OptionValue[] };
type Product = {
  id: string; name: string; slug: string; description: string; details: string | null; unit: string; category: { name: string };
  images: ProductImage[];
  options: ProductOption[];
};

type CarouselImage = ProductImage & { source: "product" | "attribute"; optionName?: string; optionValue?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const UNIT_LABELS: Record<string, string> = {
  UNIDAD: "unidad",
  METRO: "metro(s)",
  METRO_CUADRADO: "m²",
  METRO_LINEAL: "ml",
  KILOGRAMO: "kg",
  LIBRA: "lb",
  PAQUETE_1000: "paquete(s)",
  PAQUETE_500: "paquete(s)",
  PAQUETE_250: "paquete(s)",
  PAQUETE_100: "paquete(s)",
  DOCENA: "docena(s)",
  PAR: "par(es)",
  JUEGO: "juego(s)",
  ROLLO: "rollo(s)",
  CAJA: "caja(s)",
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  const [allImages, setAllImages] = useState<CarouselImage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!thumbStripRef.current) return;
    const activeBtn = thumbStripRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedImage]);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${slug}`)
      .then(async (res) => { if (!res.ok) throw new Error("not-found"); return res.json(); })
      .then((data) => {
        setProduct(data);
        setSelection(Object.fromEntries(data.options.map((o: ProductOption) => [o.name, o.values[0]?.value || ""])));
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const seen = new Set<string>();
    const combined: CarouselImage[] = [];

    for (const img of product.images) {
      if (!seen.has(img.url)) {
        seen.add(img.url);
        combined.push({ ...img, source: "product" });
      }
    }

    for (const option of product.options) {
      for (const value of option.values) {
        if (value.imageUrl && !seen.has(value.imageUrl)) {
          seen.add(value.imageUrl);
          combined.push({
            id: value.id,
            url: value.imageUrl,
            altText: `${option.name}: ${value.value}`,
            source: "attribute",
            optionName: option.name,
            optionValue: value.value,
          });
        }
      }
    }

    setAllImages(combined);
  }, [product]);

  if (notFound) return (
    <main className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Producto no disponible</h1>
      <Link href="/products" className="mt-4 inline-block text-[var(--color-primary)]">Volver al catálogo</Link>
    </main>
  );

  if (!product) return <main className="mx-auto max-w-4xl px-4 py-20 text-gray-500">Cargando producto…</main>;

  function findImageIndex(imageUrl: string): number {
    return allImages.findIndex((img) => img.url === imageUrl);
  }

  function isCurrentAttribute(imageUrl: string | null): boolean {
    if (!imageUrl || !allImages[selectedImage]) return false;
    return allImages[selectedImage].url === imageUrl;
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 sm:px-6 lg:px-8">
      <section>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 group">
          {allImages[selectedImage] ? (
            <img
              src={allImages[selectedImage].url}
              alt={allImages[selectedImage].altText || product.name}
              className="h-full w-full object-cover animate-[fadeIn_0.35s_ease-in-out]"
              key={allImages[selectedImage].id}
            />
          ) : product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Sin imagen disponible</div>
          )}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Imagen anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Siguiente imagen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
          {allImages[selectedImage]?.source === "attribute" && (
            <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
              {allImages[selectedImage].optionName}: {allImages[selectedImage].optionValue}
            </span>
          )}
        </div>
        {allImages.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-auto pb-1" ref={thumbStripRef}>
            {allImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                data-active={index === selectedImage}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  index === selectedImage
                    ? "border-[var(--color-primary)] scale-105 ring-2 ring-[var(--color-primary)]/30"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img src={image.url} alt={image.altText || `${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                {image.source === "attribute" && (
                  <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded leading-tight">
                    {image.optionValue}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <Link href="/products" className="text-sm text-[var(--color-primary)]">← Volver al catálogo</Link>
        <p className="mt-5 text-sm text-gray-500">{product.category.name}</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Venta por {UNIT_LABELS[product.unit] || product.unit}</p>
        <p className="mt-3 leading-relaxed text-gray-600">{product.description}</p>

        {product.details && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">Detalles</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.details}</p>
          </div>
        )}

        {product.options.length > 0 && (
          <div className="mt-7 space-y-5">
            {product.options.map((option) => (
              <fieldset key={option.id}>
                <legend className="mb-2 text-sm font-semibold text-gray-800">{option.name}</legend>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isActive = selection[option.name] === value.value;
                    const isShowing = isCurrentAttribute(value.imageUrl);
                    return (
                      <button
                        key={value.id}
                        onClick={() => {
                          setSelection((current) => ({ ...current, [option.name]: value.value }));
                          if (value.imageUrl) {
                            const idx = findImageIndex(value.imageUrl);
                            if (idx !== -1) setSelectedImage(idx);
                          }
                        }}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                          isActive
                            ? "border-[var(--color-primary)] bg-pink-50 text-[var(--color-primary)] shadow-md shadow-pink-200/50"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        } ${isShowing && value.imageUrl ? "animate-[bounce_0.4s_ease-in-out]" : ""}`}
                      >
                        {value.imageUrl && (
                          <img src={value.imageUrl} alt={value.value} className={`h-6 w-6 rounded-full object-cover transition-transform duration-200 ${isShowing ? "scale-110" : ""}`} />
                        )}
                        {value.value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="mt-8 inline-block w-full rounded-xl bg-[var(--color-primary)] py-3 text-center text-white font-semibold hover:opacity-90 transition"
        >
          Agregar a mi lista
        </button>
      </section>

      {product && (
        <AddToListModal
          product={{ id: product.id, name: product.name, slug: product.slug, unit: product.unit, images: product.images, options: product.options }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
