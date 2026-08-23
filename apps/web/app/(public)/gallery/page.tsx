import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galería — Adornos Rematico Villavicencio",
  description: "Explora nuestra galería de productos y proyectos",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Galería</h1>
        <p className="mt-4 text-lg">
          Mira nuestros productos y proyectos más recientes.
        </p>
      </div>
    </main>
  );
}