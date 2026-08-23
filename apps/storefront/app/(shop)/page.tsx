import Link from "next/link";
import type { Metadata } from "next";
import { products } from "../lib/products";

export const metadata: Metadata = {
  title: "Adornos Remático — Tienda de Insumos Creativos en Villavicencio",
  description:
    "Insumos para bisutería, confección, lanas, manualidades y más. Envíos a Villavicencio y al Meta.",
};

const featuredProducts = products.slice(0, 4);

const promotions = [
  {
    id: 1,
    title: "Envío Gratis",
    description:
      "En compras superiores a $150.000 en Villavicencio. Válido en tienda y por WhatsApp.",
    discount: "ENVÍO",
    code: "ENVIOGRATIS",
  },
  {
    id: 2,
    title: "Asesoría Personalizada",
    description:
      "Te ayudamos a encontrar los materiales perfectos para tu proyecto. Cotiza sin compromiso.",
    discount: "GRATIS",
    code: "ASESORIA",
  },
];

function formatCOP(value: number) {
  if (value === 0) return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function StoreHome() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Insumos para tus
              <span className="block text-yellow-300">proyectos creativos</span>
            </h1>
            <p className="mt-4 text-lg text-pink-100">
              Bisutería, lanas, hilos, confección y manualidades. Todo lo que
              necesitas para crear algo único. Envíos a todo Villavicencio.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-pink-600 shadow hover:bg-pink-50 transition-colors"
              >
                Ver Catálogo
              </Link>
              <a
                href="https://wa.me/573001234567?text=Hola, me gustaría información sobre sus productos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Promociones destacadas */}
      <section className="py-16 bg-pink-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              ¿Por qué elegirnos?
            </h2>
            <p className="mt-2 text-gray-600">
              Estamos para ayudarte con tu proyecto
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-8 text-white shadow-lg"
              >
                <div className="absolute top-4 right-4 rounded-full bg-white/20 px-4 py-2 text-2xl font-bold">
                  {promo.discount}
                </div>
                <h3 className="text-2xl font-bold">{promo.title}</h3>
                <p className="mt-2 text-white/90">{promo.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-mono">
                  Código: {promo.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Productos Destacados
              </h2>
              <p className="mt-2 text-gray-600">
                Los más pedidos por nuestros clientes
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.imagen}
                    alt={product.titulo}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium text-[var(--color-primary)] bg-pink-50 px-2 py-1 rounded-full">
                    {product.categoria.charAt(0).toUpperCase() +
                      product.categoria.slice(1)}
                  </span>
                  <h3 className="mt-2 font-semibold text-gray-900">
                    {product.titulo}
                  </h3>
                  <div className="mt-3">
                    <span className="text-lg font-bold text-[var(--color-primary)]">
                      {product.precio_desde > 0
                        ? formatCOP(product.precio_desde)
                        : product.precio_texto}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="bg-[var(--color-primary)] text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">¿Necesitas algo especial?</h2>
          <p className="mt-4 text-pink-100 max-w-xl mx-auto">
            Escríbenos por WhatsApp y te ayudamos a encontrar los materiales
            perfectos para tu proyecto o negocio.
          </p>
          <a
            href="https://wa.me/573001234567?text=Hola, necesito ayuda con un proyecto"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white hover:bg-green-600 transition-colors shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      </section>

      {/* Info */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-[var(--color-primary)] text-2xl">
                🚚
              </div>
              <h3 className="mt-4 font-semibold">Envío Gratis</h3>
              <p className="mt-2 text-sm text-gray-600">
                En compras superiores a $150.000 en Villavicencio
              </p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-[var(--color-primary)] text-2xl">
                🎨
              </div>
              <h3 className="mt-4 font-semibold">Variedad de Productos</h3>
              <p className="mt-2 text-sm text-gray-600">
                Bisutería, lanas, hilos, confección y más
              </p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-[var(--color-primary)] text-2xl">
                💳
              </div>
              <h3 className="mt-4 font-semibold">Múltiples Pagos</h3>
              <p className="mt-2 text-sm text-gray-600">
                Aceptamos efectivo, transferencia y QR BRE-B
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
