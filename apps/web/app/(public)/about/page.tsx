import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros — Adornos Rematico Villavicencio",
  description:
    "Conoce la historia y misión de Adornos Rematico Villavicencio",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Nosotros</h1>
        <p className="mt-4 text-lg">
          Somos Adornos Rematico, una empresa de Villavicencio dedicada a
          ofrecer los mejores productos de decoración para hogares, eventos y
          negocios.
        </p>
      </div>
    </main>
  );
}