import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promociones — Adornos Remático",
  description: "Aprovecha nuestras ofertas y promociones especiales",
};

const flashSales = [
  {
    id: 1,
    name: "Cuentas Metalizadas SurTidas",
    originalPrice: 5000,
    salePrice: 3000,
    image: "/imagenes maps/bisuteria.png",
    endsIn: "3d 8h",
  },
  {
    id: 2,
    name: "Lana NUBE Colores Vivos",
    originalPrice: 8000,
    salePrice: 6500,
    image: "/imagenes maps/lana.png",
    endsIn: "2d 5h",
  },
  {
    id: 3,
    name: "Parches Bordados SurTidos",
    originalPrice: 4000,
    salePrice: 2500,
    image: "/imagenes maps/parches para ropa.png",
    endsIn: "1d 12h",
  },
];

const promotions = [
  {
    id: 1,
    title: "Envío Gratis Villavicencio",
    description:
      "En compras superiores a $150.000 el envío es gratis dentro de Villavicencio. Válido en tienda y por WhatsApp.",
    discount: "ENVÍO",
    code: "ENVIOGRATIS",
    validUntil: "2026-12-31",
    category: "General",
    image: "/imagenes maps/entrada_almacen.png",
  },
  {
    id: 2,
    title: "Asesoría Personalizada Gratis",
    description:
      "Te ayudamos a encontrar los materiales perfectos para tu proyecto. Cotiza sin compromiso por WhatsApp o en tienda.",
    discount: "GRATIS",
    code: "ASESORIA",
    validUntil: "2026-12-31",
    category: "Servicio",
    image: "/imagenes maps/chelines.png",
  },
];

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function PromotionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
        <p className="mt-2 text-gray-600">
          Aprovecha nuestras ofertas especiales por tiempo limitado
        </p>
      </div>

      {/* Flash Sales */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚡</span>
          <h2 className="text-2xl font-bold text-gray-900">
            Ofertas Relámpago
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {flashSales.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  -{Math.round((1 - item.salePrice / item.originalPrice) * 100)}
                  %
                </div>
                <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Termina en {item.endsIn}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-lg font-bold text-red-500">
                    {formatCOP(item.salePrice)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatCOP(item.originalPrice)}
                  </span>
                </div>
                <a
                  href={`https://wa.me/573001234567?text=Hola, me interesa: ${item.name} en oferta`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block w-full rounded-full bg-[var(--color-primary)] py-2 text-center text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Agregar al Carrito
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promociones principales */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofertas Activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[2/1] bg-gray-100 relative">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold mb-2">
                    {promo.discount}
                  </span>
                  <h3 className="text-xl font-bold">{promo.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600">{promo.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Código:</span>
                    <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono font-bold text-gray-800">
                      {promo.code}
                    </code>
                  </div>
                  <span className="text-xs text-gray-400">
                    Válido hasta{" "}
                    {new Date(promo.validUntil).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <a
                  href={`https://wa.me/573001234567?text=Hola, quiero usar la promoción: ${promo.title} (${promo.code})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full rounded-full border-2 border-[var(--color-primary)] py-2 text-center text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  Usar Promoción
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-16 rounded-2xl bg-pink-50 p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          ¿No te quieres perder ninguna oferta?
        </h2>
        <p className="mt-2 text-gray-600">
          Escríbenos por WhatsApp y recibe nuestras promociones directo
        </p>
        <a
          href="https://wa.me/573001234567?text=Hola, quiero recibir información sobre ofertas y promociones"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white hover:bg-green-600 transition-colors shadow-lg"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Recibir Ofertas por WhatsApp
        </a>
      </section>
    </div>
  );
}
