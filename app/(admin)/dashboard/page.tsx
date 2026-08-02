import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
  description: "Panel de control y estadísticas",
};

export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pagos Recibidos
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ventas del Mes
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Productos
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Clientes
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>
    </main>
  );
}