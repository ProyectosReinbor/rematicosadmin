import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Adornos Rematico",
  description: "Panel de administración de Adornos Rematico",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r bg-card">
            <nav className="flex flex-col p-4 gap-2">
              <a href="/admin/dashboard" className="px-3 py-2 rounded hover:bg-accent">
                Dashboard
              </a>
              <a href="/admin/payments" className="px-3 py-2 rounded hover:bg-accent">
                Pagos
              </a>
              <a href="/admin/products" className="px-3 py-2 rounded hover:bg-accent">
                Productos
              </a>
              <a href="/admin/customers" className="px-3 py-2 rounded hover:bg-accent">
                Clientes
              </a>
              <a href="/admin/settings" className="px-3 py-2 rounded hover:bg-accent">
                Configuración
              </a>
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}