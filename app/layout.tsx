import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adornos Remático — Panel Admin",
  description: "Panel de administración y gestión de pagos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}