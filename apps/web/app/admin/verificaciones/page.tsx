"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchVerifications,
  fetchVerificationStats,
  createVerification,
  updateVerification,
  deleteVerification,
  PaymentVerification,
  VerificationStats,
  PaginatedResponse,
} from "../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  VERIFICADA: "bg-green-100 text-green-800",
  DISCREPANCIA: "bg-orange-100 text-orange-800",
  RECHAZADA: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  VERIFICADA: "Verificada",
  DISCREPANCIA: "Discrepancia",
  RECHAZADA: "Rechazada",
};

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(Number(amount));
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function VerificacionesPage() {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [createForm, setCreateForm] = useState({
    orderNumber: "",
    customerName: "",
    expectedAmount: "",
    expectedDate: "",
    receivedAmount: "",
    receivedDate: "",
    transactionRef: "",
    notes: "",
  });

  const loadData = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const [verifsData, statsData] = await Promise.all([
        fetchVerifications({ page, limit: 20, status: statusFilter || undefined, search: search || undefined }),
        fetchVerificationStats(),
      ]);
      setVerifications(verifsData.data);
      setPagination(verifsData.pagination);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVerification({
        orderNumber: createForm.orderNumber,
        customerName: createForm.customerName,
        expectedAmount: parseFloat(createForm.expectedAmount),
        expectedDate: createForm.expectedDate || undefined,
        receivedAmount: createForm.receivedAmount ? parseFloat(createForm.receivedAmount) : undefined,
        receivedDate: createForm.receivedDate || undefined,
        transactionRef: createForm.transactionRef || undefined,
        notes: createForm.notes || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({ orderNumber: "", customerName: "", expectedAmount: "", expectedDate: "", receivedAmount: "", receivedDate: "", transactionRef: "", notes: "" });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al crear verificación");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerification) return;
    try {
      await updateVerification(selectedVerification.id, {
        orderNumber: createForm.orderNumber,
        customerName: createForm.customerName,
        expectedAmount: parseFloat(createForm.expectedAmount),
        expectedDate: createForm.expectedDate || undefined,
        receivedAmount: createForm.receivedAmount ? parseFloat(createForm.receivedAmount) : undefined,
        receivedDate: createForm.receivedDate || undefined,
        transactionRef: createForm.transactionRef || undefined,
        notes: createForm.notes || undefined,
      });
      setShowDetailModal(false);
      setIsEditing(false);
      setSelectedVerification(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta verificación?")) return;
    try {
      await deleteVerification(id);
      setShowDetailModal(false);
      setSelectedVerification(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Motivo de rechazo:");
    if (!reason) return;
    try {
      await updateVerification(id, { status: "RECHAZADA", comparisonNotes: reason });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al rechazar");
    }
  };

  const openDetail = (v: PaymentVerification) => {
    setSelectedVerification(v);
    setShowDetailModal(true);
    setIsEditing(false);
    setCreateForm({
      orderNumber: v.orderNumber,
      customerName: v.customerName,
      expectedAmount: v.expectedAmount,
      expectedDate: v.expectedDate ? v.expectedDate.split("T")[0] : "",
      receivedAmount: v.receivedAmount || "",
      receivedDate: v.receivedDate ? v.receivedDate.split("T")[0] : "",
      transactionRef: v.transactionRef || "",
      notes: v.notes || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verificación de Pagos</h1>
          <p className="text-sm text-gray-500">Verificación manual — no se consulta Nequi automáticamente</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setCreateForm({ orderNumber: "", customerName: "", expectedAmount: "", expectedDate: "", receivedAmount: "", receivedDate: "", transactionRef: "", notes: "" }); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700"
        >
          + Nueva Verificación
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-gray-900" },
            { label: "Pendientes", value: stats.pendientes, color: "text-yellow-600" },
            { label: "Verificadas", value: stats.verificadas, color: "text-green-600" },
            { label: "Discrepancias", value: stats.discrepancias, color: "text-orange-600" },
            { label: "Rechazadas", value: stats.rechazadas, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar por pedido o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="VERIFICADA">Verificadas</option>
          <option value="DISCREPANCIA">Discrepancias</option>
          <option value="RECHAZADA">Rechazadas</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500">Cargando verificaciones...</p>
        </div>
      ) : verifications.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500">No se encontraron verificaciones</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Esperado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recibido</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verifications.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(v)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.customerName}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(v.expectedAmount)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{v.receivedAmount ? formatCurrency(v.receivedAmount) : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">Manual</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(v.createdAt)}</td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openDetail(v)} className="text-blue-600 hover:text-blue-800 text-sm mr-2">Ver</button>
                    {v.status === "PENDIENTE" && (
                      <button onClick={() => handleReject(v.id)} className="text-red-600 hover:text-red-800 text-sm">Rechazar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => loadData(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => loadData(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Nueva Verificación</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Pedido *</label>
                <input type="text" required value={createForm.orderNumber} onChange={(e) => setCreateForm({ ...createForm, orderNumber: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Cliente *</label>
                <input type="text" required value={createForm.customerName} onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto Esperado (COP) *</label>
                <input type="number" required min="0.01" step="0.01" value={createForm.expectedAmount} onChange={(e) => setCreateForm({ ...createForm, expectedAmount: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Esperada</label>
                <input type="date" value={createForm.expectedDate} onChange={(e) => setCreateForm({ ...createForm, expectedDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto Recibido (COP)</label>
                <input type="number" min="0" step="0.01" value={createForm.receivedAmount} onChange={(e) => setCreateForm({ ...createForm, receivedAmount: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Dejar vacío si aún no se recibe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Recepción</label>
                <input type="date" value={createForm.receivedDate} onChange={(e) => setCreateForm({ ...createForm, receivedDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Referencia de Transacción</label>
                <input type="text" value={createForm.transactionRef} onChange={(e) => setCreateForm({ ...createForm, transactionRef: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">Detalle de Verificación</h2>
              <button onClick={() => { setShowDetailModal(false); setIsEditing(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pedido</p>
                    <p className="text-sm font-medium">{selectedVerification.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Cliente</p>
                    <p className="text-sm font-medium">{selectedVerification.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Monto Esperado</p>
                    <p className="text-sm font-medium">{formatCurrency(selectedVerification.expectedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Monto Recibido</p>
                    <p className="text-sm font-medium">{selectedVerification.receivedAmount ? formatCurrency(selectedVerification.receivedAmount) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estado</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[selectedVerification.status]}`}>
                      {STATUS_LABELS[selectedVerification.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Método</p>
                    <p className="text-sm font-medium">Verificación manual</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha Esperada</p>
                    <p className="text-sm">{formatDate(selectedVerification.expectedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha Recepción</p>
                    <p className="text-sm">{formatDate(selectedVerification.receivedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Referencia</p>
                    <p className="text-sm">{selectedVerification.transactionRef || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Creada</p>
                    <p className="text-sm">{formatDate(selectedVerification.createdAt)}</p>
                  </div>
                </div>

                {selectedVerification.comparisonNotes && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Notas de Comparación</p>
                    <p className="text-sm">{selectedVerification.comparisonNotes}</p>
                  </div>
                )}

                {selectedVerification.notes && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Notas</p>
                    <p className="text-sm">{selectedVerification.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => handleDelete(selectedVerification.id)} className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50">Eliminar</button>
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Editar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Pedido</label>
                  <input type="text" value={createForm.orderNumber} onChange={(e) => setCreateForm({ ...createForm, orderNumber: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                  <input type="text" value={createForm.customerName} onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto Esperado (COP)</label>
                  <input type="number" min="0.01" step="0.01" value={createForm.expectedAmount} onChange={(e) => setCreateForm({ ...createForm, expectedAmount: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto Recibido (COP)</label>
                  <input type="number" min="0" step="0.01" value={createForm.receivedAmount} onChange={(e) => setCreateForm({ ...createForm, receivedAmount: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Recepción</label>
                  <input type="date" value={createForm.receivedDate} onChange={(e) => setCreateForm({ ...createForm, receivedDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Referencia</label>
                  <input type="text" value={createForm.transactionRef} onChange={(e) => setCreateForm({ ...createForm, transactionRef: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
