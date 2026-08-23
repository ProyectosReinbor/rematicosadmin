"use client";

import { useState, useEffect } from "react";
import { fetchStats, fetchRecentPayments, PaymentStats, Payment } from "../../lib/api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(amount);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, paymentsData] = await Promise.all([fetchStats(), fetchRecentPayments(5)]);
        setStats(statsData);
        setRecentPayments(paymentsData);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p className="text-gray-500">Cargando dashboard...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pagos Hoy", value: stats?.countToday ?? 0, icon: "📊" },
          { label: "Ingresos del Día", value: formatCurrency(stats?.totalToday ?? 0), icon: "💰" },
          { label: "Promedio", value: formatCurrency(stats?.average ?? 0), icon: "📈" },
          { label: "Mayor Pago", value: formatCurrency(stats?.max ?? 0), icon: "🏆" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{card.icon}</span>
              <div>
                <p className="text-xs text-gray-500 uppercase">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Pagos Recientes</h2>
        </div>
        {recentPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay pagos registrados hoy</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPayments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-sm text-gray-700">{new Date(p.createdAt).toLocaleTimeString("es-CO")}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{p.payerName}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatCurrency(Number(p.amount))}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{p.bank}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      p.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      p.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Herramientas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/verificaciones" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-medium text-gray-900">Verificar Pagos</h3>
            <p className="text-sm text-gray-500">Verificación manual de pagos Nequi</p>
          </a>
          <a href="/admin/publicidad-ia" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-medium text-gray-900">Publicidad IA</h3>
            <p className="text-sm text-gray-500">Generar fotos para publicidad</p>
          </a>
          <a href="/admin/payments" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium text-gray-900">Pagos</h3>
            <p className="text-sm text-gray-500">Historial de pagos recibidos</p>
          </a>
        </div>
      </div>
    </div>
  );
}
