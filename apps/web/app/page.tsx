"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./lib/socket";
import { useVoice } from "./lib/voice";
import {
  fetchStats,
  fetchRecentPayments,
  simulateRandomPayment,
  Payment,
  PaymentStats,
  PaymentReceivedData,
} from "./lib/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    FAILED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status === "APPROVED" ? "Aprobado" : status === "PENDING" ? "Pendiente" : "Rechazado"}
    </span>
  );
}

function NewPaymentCard({ payment, onClose }: { payment: PaymentReceivedData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 slide-in-from-bottom-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nuevo pago recibido</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{payment.payerName}</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(payment.amount)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{formatTime(new Date().toISOString())}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{payment.bank}</p>
        </div>
      </div>
    </div>
  );
}

function StatsCards({ stats }: { stats: PaymentStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pagos hoy</p>
        <p className="text-2xl font-bold mt-1">{stats.countToday}</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ingresos del día</p>
        <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(stats.totalToday)}</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Promedio</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(stats.average)}</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mayor pago</p>
        <p className="text-2xl font-bold mt-1 text-blue-600">{formatCurrency(stats.max)}</p>
      </div>
    </div>
  );
}

function PaymentTable({ payments }: { payments: Payment[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Historial de pagos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800">
              <th className="text-left p-3 font-medium text-gray-500">Hora</th>
              <th className="text-left p-3 font-medium text-gray-500">Cliente</th>
              <th className="text-left p-3 font-medium text-gray-500">Valor</th>
              <th className="text-left p-3 font-medium text-gray-500">Banco</th>
              <th className="text-left p-3 font-medium text-gray-500">Referencia</th>
              <th className="text-left p-3 font-medium text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 text-gray-500">{formatTime(payment.createdAt)}</td>
                <td className="p-3 font-medium">{payment.payerName}</td>
                <td className="p-3 font-semibold text-green-600">{formatCurrency(Number(payment.amount))}</td>
                <td className="p-3 text-gray-500">{payment.bank}</td>
                <td className="p-3 font-mono text-xs">{payment.reference}</td>
                <td className="p-3"><StatusBadge status={payment.status} /></td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No hay pagos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPayment, setNewPayment] = useState<PaymentReceivedData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const { isConnected, onPaymentReceived, onVoiceAnnounce } = useSocket();
  const { speakPayment } = useVoice();

  const loadData = useCallback(async () => {
    try {
      const [statsData, paymentsData] = await Promise.all([fetchStats(), fetchRecentPayments(20)]);
      setStats(statsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubReceived = onPaymentReceived((data: PaymentReceivedData) => {
      setNewPayment(data);
      loadData();
    });

    const unsubVoice = onVoiceAnnounce((data) => {
      speakPayment(data.payerName, data.amount);
    });

    return () => {
      unsubReceived();
      unsubVoice();
    };
  }, [onPaymentReceived, onVoiceAnnounce, loadData, speakPayment]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await simulateRandomPayment();
    } catch (error) {
      console.error("Error simulating payment:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {newPayment && (
        <NewPaymentCard payment={newPayment} onClose={() => setNewPayment(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Panel de Pagos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Adornos Remático Villavicencio</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-500">{isConnected ? "En línea" : "Desconectado"}</span>
            </div>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isSimulating ? "Simulando..." : "Simular Pago"}
            </button>
          </div>
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="mt-8">
          <PaymentTable payments={payments} />
        </div>
      </div>
    </div>
  );
}