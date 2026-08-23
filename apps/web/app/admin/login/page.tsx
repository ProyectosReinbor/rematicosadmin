"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Correo o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      window.location.href = "/admin/dashboard";
    } catch {
      setError("Error de conexión");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: "#f9fafb" }}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Adornos Rematico</h1>
          <p className="mt-2" style={{ color: "#4b5563" }}>
            Inicia sesión para acceder al panel de administración
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 p-8 rounded-lg shadow" style={{ backgroundColor: "#ffffff" }}>
          {error && (
            <div className="rounded-md p-4" style={{ backgroundColor: "#fef2f2" }}>
              <p className="text-sm" style={{ color: "#991b1b" }}>{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: "#374151" }}>
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ borderColor: "#d1d5db", color: "#111827", backgroundColor: "#ffffff" }}
              placeholder="admin@rematicos.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: "#374151" }}>
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ borderColor: "#d1d5db", color: "#111827", backgroundColor: "#ffffff" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#2563eb" }}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}
