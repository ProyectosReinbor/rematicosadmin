"use client";

import Link from "next/link";
import { useEffect, useState, use, useRef, useCallback } from "react";
import AddToListModal from "../../components/AddToListModal";

type ProductImage = { id: string; url: string; altText: string | null };
type OptionValue = { id: string; value: string };
type ProductOption = { id: string; name: string; values: OptionValue[] };
type Product = {
  id: string; name: string; slug: string; description: string; details: string | null; unit: string; category: { name: string };
  images: ProductImage[];
  options: ProductOption[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const UNIT_LABELS: Record<string, string> = {
  UNIDAD: "unidad", METRO: "metro(s)", METRO_CUADRADO: "m²", METRO_LINEAL: "ml",
  KILOGRAMO: "kg", LIBRA: "lb", PAQUETE_1000: "paquete(s)", PAQUETE_500: "paquete(s)",
  PAQUETE_250: "paquete(s)", PAQUETE_100: "paquete(s)", DOCENA: "docena(s)",
  PAR: "par(es)", JUEGO: "juego(s)", ROLLO: "rollo(s)", CAJA: "caja(s)",
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "det">("desc");
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!thumbStripRef.current) return;
    const activeBtn = thumbStripRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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

  const images = product?.images || [];

  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; }, []);
  const handleTouchEnd = useCallback(() => {
    if (!images.length) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      else setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  }, [images.length]);

  if (notFound) return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 mb-6">
        <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Producto no encontrado</h1>
      <p className="mt-2 text-gray-500">El producto que buscas no está disponible o fue removido.</p>
      <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white hover:bg-rose-700 shadow-lg shadow-rose-200/50 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Volver al catálogo
      </Link>
    </main>
  );

  if (!product) return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="animate-pulse space-y-6">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="h-5 bg-gray-100 rounded-full w-1/4" />
        <div className="h-8 bg-gray-100 rounded-full w-2/3" />
        <div className="h-4 bg-gray-100 rounded-full w-full" />
      </div>
    </main>
  );

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12">
        <nav className="py-3 sm:py-5 text-sm text-gray-400 overflow-hidden">
          <Link href="/products" className="hover:text-rose-600 transition-colors">Catálogo</Link>
          <span className="mx-1.5 sm:mx-2">/</span>
          <Link href={`/products?category=${product.category.name.toLowerCase()}`} className="hover:text-rose-600 transition-colors hidden sm:inline">{product.category.name}</Link>
          <span className="mx-1.5 sm:mx-2 hidden sm:inline">/</span>
          <span className="text-gray-900 font-medium truncate inline-block max-w-[180px] sm:max-w-none align-bottom">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:gap-10 pb-10 lg:grid-cols-[1fr,1fr] lg:items-start">
          <section className="lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square touch-pan-y" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              {images[selectedImage] ? (
                <img src={images[selectedImage].url} alt={images[selectedImage].altText || product.name} className="h-full w-full object-cover transition-opacity duration-300" key={images[selectedImage].id} />
              ) : (
                <div className="flex h-full items-center justify-center"><svg className="mx-auto w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110" aria-label="Imagen anterior">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110" aria-label="Siguiente imagen">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 max-w-[calc(100%-2rem)] overflow-hidden">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === selectedImage ? "bg-white w-4" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide" ref={thumbStripRef}>
                {images.map((image, index) => (
                  <button key={image.id} onClick={() => setSelectedImage(index)} data-active={index === selectedImage} className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${index === selectedImage ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"}`}>
                    <img src={image.url} alt={image.altText || `${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-5 sm:space-y-6">
            <div>
              <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 mb-3">{product.category.name}</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                Venta por {UNIT_LABELS[product.unit] || product.unit}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
              <div className="flex border-b border-gray-100 mb-4">
                <button onClick={() => setActiveTab("desc")} className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "desc" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Descripción</button>
                {product.details && (
                  <button onClick={() => setActiveTab("det")} className={`pb-2.5 ml-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "det" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Detalles</button>
                )}
              </div>
              <div className="text-sm sm:text-base leading-relaxed text-gray-600 whitespace-pre-line">{activeTab === "desc" ? product.description : product.details}</div>
            </div>

            {product.options.length > 0 && (
              <div className="space-y-5">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <label className="block text-sm font-semibold text-gray-900 mb-2.5">{option.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isActive = selection[option.name] === value.value;
                        return (
                          <button key={value.id} onClick={() => setSelection((current) => ({ ...current, [option.name]: value.value }))} className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? "border-rose-500 bg-rose-50 text-rose-700 shadow-md shadow-rose-100/50" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
                            {value.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowModal(true)} className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 sm:py-4 text-center text-white font-semibold text-base shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Agregar a mi lista
              </span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">¿Tienes dudas?</p>
                <a href="https://wa.me/573113487967" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">Escríbenos por WhatsApp</a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {product && (
        <AddToListModal product={{ id: product.id, name: product.name, slug: product.slug, unit: product.unit, images: product.images, options: product.options }} isOpen={showModal} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
