'use client';
import { useState } from 'react';
import { apiRequest } from '../../lib/api';

export default function CatalogBackup({ onRestored }: { onRestored: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [backup, setBackup] = useState<{
    text: string;
    name: string;
    date: string;
    categories: number;
    products: number;
    images: number;
  } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const exportBackup = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await apiRequest<unknown>('/api/catalog-backup/export');
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `rematico-catalogo-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        'Respaldo descargado. Guárdalo fuera del servidor para poder recuperarlo si se pierden los datos.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo exportar el catálogo.');
    } finally {
      setBusy(false);
    }
  };
  const chooseFile = async (file: File | undefined) => {
    setBackup(null);
    setConfirmed(false);
    setError('');
    setMessage('');
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 500 * 1024 * 1024) throw new Error('El archivo supera el límite de 500 MB.');
      const text = await file.text();
      const data = JSON.parse(text);
      if (
        data.format !== 'rematico-catalog' ||
        data.version !== 1 ||
        !Array.isArray(data.categories) ||
        !Array.isArray(data.products) ||
        !Array.isArray(data.images) ||
        !Array.isArray(data.files) ||
        !Number.isFinite(Date.parse(data.exportedAt))
      )
        throw new Error('Selecciona un respaldo válido de Rematico.');
      setBackup({
        text,
        name: file.name,
        date: new Date(data.exportedAt).toLocaleString('es-CO'),
        categories: data.categories.length,
        products: data.products.length,
        images: data.images.length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer el respaldo.');
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    if (!backup || !confirmed) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest('/api/catalog-backup/import', { method: 'POST', body: backup.text });
      setBackup(null);
      setConfirmed(false);
      setMessage('Catálogo restaurado correctamente, incluidas sus imágenes.');
      onRestored();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo restaurar el catálogo.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-label="Respaldos del catálogo"
      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold">Respaldo del catálogo</h2>
        <p className="text-sm text-gray-600 mt-1">
          Descarga categorías, productos, tipos, tarjetas e imágenes para recuperar el catálogo más
          adelante. No incluye usuarios ni otros datos del negocio.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={exportBackup}
          className="rounded-xl bg-red-700 text-white px-4 py-3 font-semibold disabled:opacity-50"
        >
          Exportar catálogo completo
        </button>
        <label className="block text-sm font-semibold">
          Importar respaldo guardado
          <input
            aria-label="Importar respaldo guardado"
            disabled={busy}
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              void chooseFile(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="block mt-1 max-w-full text-sm"
          />
        </label>
      </div>
      {backup && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
          <p className="font-semibold break-all">{backup.name}</p>
          <p className="text-sm">
            Fecha: {backup.date}. {backup.categories} categorías, {backup.products} tarjetas y{' '}
            {backup.images} imágenes de productos.
          </p>
          <p className="text-sm text-amber-900">
            Restaurar reemplaza todo el catálogo actual por el estado guardado. Los cambios
            posteriores a este respaldo se perderán. Exporta primero si quieres conservarlos.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={busy}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            Confirmo que quiero reemplazar el catálogo actual con este respaldo.
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy || !confirmed}
              onClick={restore}
              className="bg-red-700 rounded-xl text-white px-4 py-2 disabled:opacity-50"
            >
              Restaurar catálogo
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBackup(null);
                setConfirmed(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {busy && (
        <p role="status" className="text-sm text-gray-600">
          Procesando el respaldo. Espera a que termine antes de cerrar esta página.
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-green-800">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
