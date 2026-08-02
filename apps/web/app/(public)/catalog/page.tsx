import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo — Adornos Rematico Villavicencio",
  description: "Explora nuestro catálogo de productos y adornos",
};

export default function CatalogPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="mt-4 text-lg">
          Descubre nuestra selección de adornos y decoraciones.
        </p>
      </div>
    </main>
  );
}