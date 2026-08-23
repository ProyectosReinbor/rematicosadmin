import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Adornos Rematico Villavicencio",
  description: "Preguntas frecuentes sobre nuestros productos y servicios",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Preguntas Frecuentes</h1>
        <p className="mt-4 text-lg">
          Aquí encontrarás respuestas a las preguntas más comunes.
        </p>
      </div>
    </main>
  );
}