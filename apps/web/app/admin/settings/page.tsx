import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración — Admin",
  description: "Configuración del sistema",
};

export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <p className="text-gray-500">Configuración general del sistema.</p>
    </main>
  );
}
