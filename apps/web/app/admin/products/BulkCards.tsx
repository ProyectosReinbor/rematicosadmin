'use client';
import { useState } from 'react';
import { apiRequest, uploadImages } from '../../lib/api';

type Row = { id: string; file: File; name: string; url?: string };
export default function BulkCards({
  categoryId,
  typeId,
  destination,
  disabled,
  onBusyChange,
  onCreated,
}: {
  categoryId: string;
  typeId: string;
  destination: string;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onCreated: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('PUBLISHED');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const choose = (files: FileList | null) => {
    setError('');
    setMessage('');
    if (!files) return;
    const selected = Array.from(files);
    if (selected.length > 300) {
      setError('Selecciona hasta 300 imágenes por lote.');
      return;
    }
    const invalid = selected.find(
      (file) =>
        !/\.(jpe?g|png|webp|gif)$/i.test(file.name) ||
        file.size > 10 * 1024 * 1024 ||
        file.size === 0,
    );
    if (invalid) {
      setError(`${invalid.name}: usa JPG, PNG, WebP o GIF, de hasta 10 MB por imagen.`);
      return;
    }
    setRows(
      selected.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name.replace(/\.[^.]+$/, '').trim(),
      })),
    );
  };
  const create = async () => {
    if (!rows.length) return;
    if (rows.some((row) => row.name.trim().length < 3 || row.name.trim().length > 160)) {
      setError(
        'Cada nombre debe tener entre 3 y 160 caracteres. Puedes corregirlo antes de guardar.',
      );
      return;
    }
    setBusy(true);
    onBusyChange(true);
    setError('');
    setMessage('');
    const prepared = rows.map((row) => ({ ...row }));
    try {
      // Cuatro imágenes por petición caben incluso con archivos de 10 MB.
      const pending = prepared.filter((row) => !row.url);
      for (let i = 0; i < pending.length; i += 4) {
        setProgress(
          `Subiendo imágenes: ${prepared.filter((row) => row.url).length} de ${prepared.length}…`,
        );
        const chunk = pending.slice(i, i + 4);
        const uploaded = await uploadImages(chunk.map((row) => row.file));
        if (uploaded.length !== chunk.length)
          throw new Error('No se recibieron todas las imágenes. Intenta nuevamente.');
        chunk.forEach((row, index) => {
          row.url = uploaded[index].url;
        });
        setRows(prepared.map((row) => ({ ...row })));
      }
      setProgress(`Guardando ${prepared.length} tarjetas…`);
      await apiRequest('/api/products/bulk', {
        method: 'POST',
        body: JSON.stringify({
          categoryId,
          typeId,
          status,
          cards: prepared.map((row) => ({
            id: row.id,
            name: row.name.trim(),
            image: { url: row.url, altText: row.name.trim() },
          })),
        }),
      });
      setRows([]);
      setOpen(false);
      setMessage(`${prepared.length} tarjetas guardadas en ${destination}.`);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el lote. Intenta nuevamente.');
    } finally {
      setBusy(false);
      onBusyChange(false);
      setProgress('');
    }
  };
  return (
    <fieldset
      disabled={disabled}
      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4"
      aria-label="Crear varias tarjetas"
    >
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="font-bold">Crear varias tarjetas</h3>
          <p className="text-sm text-gray-600">
            Una imagen por tarjeta. El nombre se obtiene del archivo sin su extensión.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(!open)}
          className="rounded-xl border border-red-700 text-red-700 px-4 py-2 font-semibold disabled:opacity-40"
        >
          {open ? 'Cerrar' : 'Seleccionar varias imágenes'}
        </button>
      </div>
      {open && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">Se agregarán a: {destination}</p>
          <label className="block text-sm">
            Imágenes (hasta 300, máximo 10 MB cada una)
            <input
              type="file"
              multiple
              disabled={busy}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block mt-2 max-w-full"
              onChange={(e) => {
                choose(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          {!!rows.length && (
            <>
              <p className="text-sm">
                {rows.length} tarjetas seleccionadas. Puedes corregir los nombres o quitar imágenes
                antes de guardar.
              </p>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl border p-3"
                  >
                    <span className="w-full text-xs text-gray-500 break-all">{row.file.name}</span>
                    <input
                      aria-label={`Nombre de ${row.file.name}`}
                      value={row.name}
                      disabled={busy}
                      minLength={3}
                      maxLength={160}
                      onChange={(e) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, name: e.target.value } : item,
                          ),
                        )
                      }
                      className="min-w-0 flex-1 rounded-lg border p-2"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setRows((current) => current.filter((item) => item.id !== row.id))
                      }
                      className="text-red-700 p-2"
                      aria-label={`Quitar ${row.file.name}`}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <label className="block text-sm">
                Visibilidad de las tarjetas
                <select
                  value={status}
                  disabled={busy}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block mt-1 rounded-xl border p-2"
                >
                  <option value="PUBLISHED">Publicado</option>
                  <option value="DRAFT">Borrador</option>
                </select>
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={create}
                className="rounded-xl bg-red-700 px-5 py-3 text-white font-semibold disabled:opacity-40"
              >
                {busy ? 'Creando tarjetas…' : `Crear ${rows.length} tarjetas`}
              </button>
            </>
          )}
        </div>
      )}
      {progress && (
        <p role="status" className="text-sm">
          {progress} No cierres esta página hasta terminar.
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
    </fieldset>
  );
}
