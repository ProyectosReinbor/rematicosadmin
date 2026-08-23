import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos — Admin",
  description: "Gestión de productos",
};

export default function ProductsPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Productos</h1>
      <p className="text-gray-500">Gestión de productos del catálogo.</p>
    </main>
  );
}
