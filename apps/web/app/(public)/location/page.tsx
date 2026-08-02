import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubicación — Adornos Rematico Villavicencio",
  description: "Encuéntranos en Villavicencio, Colombia",
};

export default function LocationPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Ubicación</h1>
        <p className="mt-4 text-lg">
          Visítanos en Villavicencio, Meta, Colombia.
        </p>
      </div>
    </main>
  );
}