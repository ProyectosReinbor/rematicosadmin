import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros — Adornos Remático",
  description: "Conoce la historia y misión de Adornos Remático Villavicencio",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Nuestra Historia</h1>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        <p className="text-lg">
          Somos <strong className="text-gray-900">Adornos Remático</strong>, una
          empresa familiar de Villavicencio dedicada a ofrecer los mejores
          productos de decoración para hogares, eventos y negocios desde 2015.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="rounded-2xl bg-pink-50 p-8 text-center">
            <span className="text-4xl">🎯</span>
            <h3 className="mt-4 font-bold text-gray-900">Nuestra Misión</h3>
            <p className="mt-2 text-gray-600">
              Hacer de cada celebración un momento inolvidable con decoraciones
              de calidad, creatividad y atención personalizada.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-8 text-center">
            <span className="text-4xl">✨</span>
            <h3 className="mt-4 font-bold text-gray-900">Nuestra Visión</h3>
            <p className="mt-2 text-gray-600">
              Ser la tienda de referencia en decoración en Villavicencio y el
              departamento del Meta, reconocidos por la calidad y el servicio.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">¿Por qué elegirnos?</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] mt-1">✓</span>
            <span>
              <strong>Experiencia:</strong> Más de 8 años decorando eventos
              especiales en la región.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] mt-1">✓</span>
            <span>
              <strong>Calidad:</strong> Trabajamos con los mejores proveedores
              para garantizar productos de primera.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] mt-1">✓</span>
            <span>
              <strong>Personalización:</strong> Creamos diseños a medida según
              tus gustos y necesidades.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] mt-1">✓</span>
            <span>
              <strong>Precio justo:</strong> Ofrecemos la mejor relación
              calidad-precio del mercado.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] mt-1">✓</span>
            <span>
              <strong>Atención personalizada:</strong> Te asesoramos en cada
              paso para que tu evento sea perfecto.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
