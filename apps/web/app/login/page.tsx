"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    if (token) document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=Lax`;
    if (refresh) document.cookie = `refreshToken=${refresh}; path=/; max-age=604800; SameSite=Lax`;

    window.location.href = "/admin/products";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xl font-bold shadow-lg shadow-rose-200/50 mb-4">R</div>
          <h1 className="text-2xl font-bold text-gray-900">Adornos Remático</h1>
          <p className="mt-2 text-sm text-gray-500">Inicia sesión para acceder al panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">
            Correo electrónico
            <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@rematicos.com" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition" />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Contraseña
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition" />
          </label>

          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/60 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}
