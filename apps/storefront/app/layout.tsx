import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adornos Remático — Tienda de Decoración en Villavicencio",
  description:
    "Explora nuestro catálogo de adornos, decoraciones y más. Envíos a Villavicencio y al Meta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
