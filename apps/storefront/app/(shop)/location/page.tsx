import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubicación — Adornos Remático",
  description: "Encuéntranos en Villavicencio, Meta",
};

export default function LocationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Encuéntranos</h1>
      <p className="mt-2 text-gray-600">
        Visítanos en nuestra tienda en el centro de Villavicencio
      </p>

      <div className="mt-8 rounded-2xl overflow-hidden border shadow-sm">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <span className="text-4xl">📍</span>
            <p className="mt-2 text-sm">Mapa de ubicación</p>
            <p className="text-xs text-gray-400">
              Calle 40 #15-23, Centro, Villavicencio
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-pink-50 p-6">
          <h3 className="font-bold text-gray-900">Dirección</h3>
          <p className="mt-2 text-gray-600">
            Calle 40 #15-23, Centro<br />
            Villavicencio, Meta, Colombia
          </p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-6">
          <h3 className="font-bold text-gray-900">Horario</h3>
          <p className="mt-2 text-gray-600">
            Lunes a Sábado: 8:00 AM - 7:00 PM<br />
            Domingos: 9:00 AM - 2:00 PM
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a
          href="https://maps.google.com/?q=Calle+40+15-23+Villavicencio+Meta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
}
