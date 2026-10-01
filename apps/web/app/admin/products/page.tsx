'use client';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest, uploadImages } from '../../lib/api';
type Node = { id: string; name: string };
type Category = Node & { slug: string; groups: (Node & { types: Node[] })[] };
type Card = Node & {
  slug: string;
  categoryId: string;
  typeId: string | null;
  description: string;
  unit: string;
  status: string;
  images: { url: string }[];
};
const base = ['confeccion', 'confaccion', 'agujas', 'hilos', 'decoracion', 'lanas', 'tijeras'];
async function request<T = unknown>(path: string, method = 'GET', body?: unknown) {
  return apiRequest<T>(`/api/${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
export default function ProductsPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Unidad');
  const [status, setStatus] = useState('PUBLISHED');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState('');
  const [editing, setEditing] = useState<Card | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [nodeForm, setNodeForm] = useState<{
    kind: 'categories' | 'groups' | 'types';
    id?: string;
    name: string;
  } | null>(null);
  const category = tree.find((c) => c.id === categoryId);
  const group = category?.groups.find((g) => g.id === groupId);
  useEffect(() => {
    let active = true;
    request<Category[]>('catalog/tree')
      .then((data) => {
        if (active) setTree(data);
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [revision]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '24' });
    if (category) params.set('category', category.slug);
    if (groupId) params.set('groupId', groupId);
    if (typeId) params.set('typeId', typeId);
    request<{ data: Card[]; pagination: { totalPages: number } }>(`products/admin/list?${params}`)
      .then((data) => {
        if (active) {
          setCards(data.data);
          setPages(data.pagination.totalPages);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category?.slug, groupId, typeId, page, revision]);
  const perform = async (fn: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      setRevision((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  };
  const remove = (kind: string, node: Node) => {
    if (confirm(`¿Eliminar ${node.name}? Los elementos que contiene deben estar vacíos.`))
      void perform(async () => {
        await request(`catalog/${kind}/${node.id}`, 'DELETE');
        if (kind === 'categories') {
          setCategoryId('');
          setGroupId('');
          setTypeId('');
        }
        if (kind === 'groups') {
          setGroupId('');
          setTypeId('');
        }
        if (kind === 'types') setTypeId('');
      });
  };
  const saveNode = (e: FormEvent) => {
    e.preventDefault();
    if (!nodeForm) return;
    void perform(async () => {
      const path =
        nodeForm.kind === 'categories' ? 'products/categories' : `catalog/${nodeForm.kind}`;
      await request(
        `${path}${nodeForm.id ? `/${nodeForm.id}` : ''}`,
        nodeForm.id ? 'PUT' : 'POST',
        { name: nodeForm.name, categoryId, groupId },
      );
      setNodeForm(null);
    });
  };
  const saveCard = (e: FormEvent) => {
    e.preventDefault();
    void perform(async () => {
      if (!typeId) throw new Error('Selecciona categoría, producto y tipo antes de guardar');
      let imageUrl = image;
      if (file) imageUrl = (await uploadImages([file], name))[0].url;
      if (!imageUrl) throw new Error('Sube una imagen para la tarjeta');
      const body = {
        name,
        unit: unit.trim(),
        categoryId,
        typeId,
        status,
        description: editing?.description || '',
      };
      if (editing) {
        await request(`products/${editing.id}`, 'PUT', {
          ...body,
          ...(file ? { images: [{ url: imageUrl, altText: name }] } : {}),
        });
      } else
        await request('products', 'POST', { ...body, images: [{ url: imageUrl, altText: name }] });
      setFormOpen(false);
      setEditing(null);
      setFile(null);
      setImage('');
      setName('');
      setPage(1);
    });
  };
  const input = 'w-full rounded-xl border border-gray-300 p-3';
  const editCard = (card: Card) => {
    const cat = tree.find((c) => c.id === card.categoryId);
    const grp = cat?.groups.find((g) => g.types.some((t) => t.id === card.typeId));
    setCategoryId(card.categoryId);
    setGroupId(grp?.id || '');
    setTypeId(card.typeId || '');
    setEditing(card);
    setName(card.name);
    setUnit(card.unit);
    setStatus(card.status);
    setImage(card.images[0]?.url || '');
    setFile(null);
    setFormOpen(true);
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-red-700 font-semibold">REMATICO VILLAVICENCIO</p>
        <h1 className="text-3xl font-bold">Administrar catálogo</h1>
        <p className="mt-2 text-gray-600">
          Categoría → producto → tipo → tarjetas. Sin precios, con consultas por WhatsApp.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            kind: 'categories' as const,
            title: '1. Categorías',
            nodes: tree,
            selected: categoryId,
            enabled: true,
          },
          {
            kind: 'groups' as const,
            title: '2. Productos',
            nodes: category?.groups || [],
            selected: groupId,
            enabled: !!categoryId,
          },
          {
            kind: 'types' as const,
            title: '3. Tipos',
            nodes: group?.types || [],
            selected: typeId,
            enabled: !!groupId,
          },
        ].map((level) => (
          <div key={level.kind} className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold mb-3">{level.title}</h2>
            <button
              disabled={!level.enabled || busy}
              className="mb-4 text-red-700 disabled:opacity-40"
              onClick={() => setNodeForm({ kind: level.kind, name: '' })}
            >
              + Crear
            </button>
            <div className="max-h-80 overflow-auto space-y-2">
              {level.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`rounded-xl border p-2 ${level.selected === node.id ? 'border-red-500 bg-red-50' : ''}`}
                >
                  <button
                    className="w-full text-left font-medium p-1"
                    onClick={() => {
                      setPage(1);
                      if (level.kind === 'categories') {
                        setCategoryId(node.id);
                        setGroupId('');
                        setTypeId('');
                      } else if (level.kind === 'groups') {
                        setGroupId(node.id);
                        setTypeId('');
                      } else setTypeId(node.id);
                    }}
                  >
                    {node.name}
                  </button>
                  <div className="flex gap-3 text-xs p-1">
                    <button
                      disabled={busy}
                      onClick={() =>
                        setNodeForm({ kind: level.kind, id: node.id, name: node.name })
                      }
                    >
                      Editar
                    </button>
                    {level.kind === 'categories' && base.includes((node as Category).slug) ? (
                      <span className="text-green-700">Principal · protegida</span>
                    ) : (
                      <button
                        disabled={busy}
                        className="text-red-700"
                        onClick={() => remove(level.kind, node)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!level.nodes.length && (
              <p className="text-sm text-gray-500">
                {level.enabled ? 'Todavía no hay registros.' : 'Selecciona el nivel anterior.'}
              </p>
            )}
          </div>
        ))}
      </section>
      {nodeForm && (
        <form onSubmit={saveNode} className="rounded-xl border bg-yellow-50 p-4 space-y-3">
          <label className="block font-semibold">
            {nodeForm.id ? 'Editar' : 'Crear'}{' '}
            {nodeForm.kind === 'categories'
              ? 'categoría'
              : nodeForm.kind === 'groups'
                ? 'producto'
                : 'tipo'}
            <input
              autoFocus
              required
              minLength={2}
              maxLength={80}
              className={`${input} mt-2`}
              value={nodeForm.name}
              onChange={(e) => setNodeForm({ ...nodeForm, name: e.target.value })}
            />
          </label>
          <button disabled={busy} className="rounded-lg bg-red-700 text-white px-5 py-2">
            Guardar
          </button>
          <button type="button" className="ml-4" onClick={() => setNodeForm(null)}>
            Cancelar
          </button>
        </form>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Tarjetas {group ? `de ${group.name}` : 'del catálogo'}
        </h2>
        <button
          disabled={!typeId || busy}
          className="rounded-xl bg-red-700 text-white px-5 py-3 disabled:opacity-40"
          onClick={() => {
            setEditing(null);
            setName('');
            setUnit('Unidad');
            setStatus('PUBLISHED');
            setImage('');
            setFile(null);
            setFormOpen(true);
          }}
        >
          + Agregar tarjeta
        </button>
      </div>
      {!typeId && (
        <p className="text-sm text-gray-500">
          Selecciona un tipo para agregar tarjetas. Las tarjetas antiguas se pueden editar para
          clasificarlas.
        </p>
      )}
      {formOpen && (
        <form onSubmit={saveCard} className="rounded-2xl border bg-white p-5 space-y-4">
          <h3 className="font-bold">{editing ? 'Editar tarjeta' : 'Nueva tarjeta'}</h3>
          {!typeId && (
            <p className="text-red-700">
              Selecciona un producto y su tipo en los paneles superiores.
            </p>
          )}
          <label className="block">
            Nombre
            <input
              required
              minLength={3}
              maxLength={160}
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            Cómo se vende
            <input
              required
              maxLength={60}
              list="units"
              className={input}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <datalist id="units">
              {[
                'Unidad',
                'Kilogramo',
                'Docena',
                'Rollo',
                'Metro',
                'Paquete de 10 unidades',
                'Paquete de 100 unidades',
                'Caja',
                'Par',
              ].map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
            <span className="text-sm text-gray-500">
              Elige una presentación o escribe una nueva, por ejemplo: paquete de 24 unidades.
            </span>
          </label>
          <label className="block">
            Imagen del producto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={!image}
              className={input}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {image && <img src={image} alt={name} className="h-32 object-contain" />}
          <label className="block">
            Visibilidad
            <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PUBLISHED">Publicado</option>
              <option value="DRAFT">Borrador</option>
              <option value="UNAVAILABLE">Oculto</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </label>
          <button
            disabled={busy || !typeId}
            className="rounded-xl bg-red-700 text-white px-5 py-3 disabled:opacity-40"
          >
            {busy ? 'Guardando…' : 'Guardar tarjeta'}
          </button>
          <button type="button" className="ml-4" onClick={() => setFormOpen(false)}>
            Cancelar
          </button>
        </form>
      )}
      {loading ? (
        <p>Cargando tarjetas…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.id} className="rounded-2xl border bg-white p-4">
              {card.images[0] && (
                <img
                  src={card.images[0].url}
                  alt={card.name}
                  className="h-40 w-full object-contain"
                />
              )}
              <h3 className="font-bold mt-3">{card.name}</h3>
              <p className="text-sm text-gray-600">
                {card.unit} · {card.status === 'PUBLISHED' ? 'Publicado' : 'Oculto'}
              </p>
              {!card.typeId && (
                <p className="text-xs text-amber-800 mt-2">Pendiente de clasificar</p>
              )}
              <div className="mt-4 flex gap-4">
                <button disabled={busy} onClick={() => editCard(card)}>
                  Editar
                </button>
                <button
                  disabled={busy}
                  className="text-red-700"
                  onClick={() => {
                    if (confirm(`¿Eliminar la tarjeta ${card.name}?`))
                      void perform(async () => {
                        await request(`products/${card.id}`, 'DELETE');
                      });
                  }}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !cards.length && (
        <p className="text-gray-500">Todavía no hay tarjetas en esta selección.</p>
      )}
      <div className="flex gap-4">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </button>
        <span>
          Página {page} de {Math.max(1, pages)}
        </span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
