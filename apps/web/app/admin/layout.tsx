"use client";

import { useAuth } from "../lib/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin/products", label: "Productos", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  )},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white text-sm font-bold">R</div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">Adornos Remático</h1>
            <p className="text-[10px] text-gray-400 font-medium">Panel Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-rose-50 text-rose-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3 shrink-0">
          <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 mb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { document.cookie = "accessToken=; path=/; max-age=0"; document.cookie = "refreshToken=; path=/; max-age=0"; logout(); router.push("/login"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 shrink-0 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition lg:hidden" aria-label="Abrir menú">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Productos</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
