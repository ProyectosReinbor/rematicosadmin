import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clientes — Admin",
  description: "Gestión de clientes",
};

export default function CustomersPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>
      <p className="text-gray-500">Gestión de clientes y contactos.</p>
    </main>
  );
}
