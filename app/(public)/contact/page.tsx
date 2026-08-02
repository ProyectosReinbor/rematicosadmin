import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto — Adornos Rematico Villavicencio",
  description: "Contáctanos para cotizaciones y pedidos",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Contacto</h1>
        <p className="mt-4 text-lg">
          Ponte en contacto con nosotros para más información.
        </p>
      </div>
    </main>
  );
}