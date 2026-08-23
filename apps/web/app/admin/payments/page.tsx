"use client";

import { useState, useEffect } from "react";
import { fetchPayments, Payment } from "../../lib/api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(amount);
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchPayments({ page, pageSize: 20, status: statusFilter || undefined });
        setPayments(data.payments);
        setTotal(data.total);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="APPROVED">Aprobados</option>
          <option value="REJECTED">Rechazados</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border p-12 text-center"><p className="text-gray-500">Cargando...</p></div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center"><p className="text-gray-500">No hay pagos</p></div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{new Date(p.createdAt).toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.payerName}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(p.amount))}</td>
                  <td className="px-4 py-3 text-sm">{p.bank}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">{p.reference}</td>
                  <td className="px-4 py-3 text-center">
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
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Total: {total} pagos</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Anterior</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={payments.length < 20} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
