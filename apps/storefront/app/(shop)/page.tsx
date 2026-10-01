import Link from 'next/link';
const categories = [
  {
    slug: 'confeccion',
    name: 'Confección',
    icon: '👗',
    detail: 'Cintas, elásticos y los detalles que transforman tus prendas.',
  },
  {
    slug: 'agujas',
    name: 'Agujas',
    icon: '🪡',
    detail: 'Encuentra la aguja para cada puntada y cada proyecto.',
  },
  {
    slug: 'hilos',
    name: 'Hilos',
    icon: '🧵',
    detail: 'Dale color a tus ideas, desde la costura hasta el bordado.',
  },
  {
    slug: 'decoracion',
    name: 'Decoración',
    icon: '🎀',
    detail: 'Pequeños detalles para crear algo especial.',
  },
  {
    slug: 'lanas',
    name: 'Lanas',
    icon: '🧶',
    detail: 'Texturas y colores para tejer con imaginación.',
  },
  {
    slug: 'tijeras',
    name: 'Tijeras',
    icon: '✂️',
    detail: 'El corte preciso que tu trabajo necesita.',
  },
];
export default function HomePage() {
  return (
    <div>
      <section className="bg-[#bc1736] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#ffe482] uppercase tracking-[0.22em] text-xs font-bold">
              Villavicencio · Al por mayor y al detal
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mt-5">
              Todo empieza
              <br />
              con una <span className="text-[#ffe482]">buena idea.</span>
            </h1>
            <p className="mt-6 text-lg text-red-100 max-w-lg">
              Los insumos y adornos para hacerla realidad están en Rematico. Encuentra tus favoritos
              y consulta su disponibilidad con nosotros.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/products"
                className="bg-[#ffe482] text-[#621324] font-bold rounded-xl px-6 py-4"
              >
                Explorar catálogo →
              </Link>
              <a
                href="https://wa.me/573113487967"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/50 rounded-xl px-6 py-4 font-semibold"
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-8">
            <img
              src="/logo.jpeg"
              alt="Rematico Villavicencio — Comercializadora Isanvictorino S.A.S."
              className="w-full rounded-xl"
            />
            <div className="mt-7 grid grid-cols-3 gap-4 text-center">
              {['Crea', 'Decora', 'Teje'].map((word, i) => (
                <div key={word}>
                  <p className="text-4xl">{['🪡', '🎀', '🧶'][i]}</p>
                  <p className="mt-3 font-bold text-yellow-100">{word}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="bg-[#fff8df] border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap gap-5 justify-between text-sm font-semibold text-[#6c5420]">
          <span>✓ Venta al por mayor y al detal</span>
          <span>✓ Presentaciones para cada necesidad</span>
          <span>✓ Atención directa por WhatsApp</span>
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-red-700 text-xs uppercase tracking-widest font-bold">
          Encuentra lo que necesitas
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold mt-3">Un mundo de posibilidades</h2>
        <p className="text-gray-600 mt-3 mb-8">
          Explora nuestras seis categorías y descubre productos para tu próximo proyecto.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="group rounded-2xl border border-gray-200 p-7 hover:border-red-400 hover:shadow-lg transition"
            >
              <span className="text-4xl inline-flex bg-[#fff8df] rounded-2xl p-4">{c.icon}</span>
              <h3 className="mt-5 text-xl font-bold group-hover:text-red-700">{c.name}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">{c.detail}</p>
              <p className="mt-5 text-red-700 font-semibold text-sm">Ver productos →</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-[#eff8f1]">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-green-800 uppercase tracking-widest text-xs font-bold">
              Así de fácil
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Arma tu lista.
              <br />
              Nosotros te asesoramos.
            </h2>
          </div>
          <ol className="space-y-5 text-gray-700">
            <li>
              <strong>1. Encuentra tus productos.</strong> Elige categoría, producto y tipo.
            </li>
            <li>
              <strong>2. Indica cuánto necesitas.</strong> Cada tarjeta muestra su presentación.
            </li>
            <li>
              <strong>3. Consulta por WhatsApp.</strong> Envía tu lista para confirmar
              disponibilidad.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
