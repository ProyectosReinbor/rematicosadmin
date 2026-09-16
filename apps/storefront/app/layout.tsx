import type { Metadata } from "next";
import "./globals.css";
import { ShoppingListProvider } from "./lib/shopping-list-context";

export const metadata: Metadata = {
  title: "Adornos Remático — Catálogo de insumos creativos",
  description:
    "Explora nuestro catálogo de insumos creativos y consulta disponibilidad por producto.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ShoppingListProvider>{children}</ShoppingListProvider>
      </body>
    </html>
  );
}
