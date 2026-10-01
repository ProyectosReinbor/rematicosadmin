'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Grid2X2, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const categories = [
  {
    slug: 'confeccion',
    name: 'Confección',
    color: '#8b55cf',
    background: '#f3ecfb',
    path: 'M8 4 4 6l-3 5 4 2 2-3v12h10V8l2 3 4-2-3-5-4-2c0 4-8 4-8 0Z',
  },
  {
    slug: 'agujas',
    name: 'Agujas',
    color: '#4889d3',
    background: '#edf5fd',
    path: 'M5 4v16M12 4v16M19 4v16M5 2v3M12 2v3M19 2v3M3 3h4M10 3h4M17 3h4',
  },
  {
    slug: 'hilos',
    name: 'Hilos',
    color: '#dd5360',
    background: '#fcecef',
    path: 'M7 3h10M7 21h10M8 3v18M16 3v18M8 7h8M8 10h8M8 13h8M8 16h8M16 17c5 0 6 2 4 4',
  },
  {
    slug: 'decoracion',
    name: 'Decoración',
    color: '#c18b27',
    background: '#fff6df',
    path: 'M12 12C2 3 0 15 9 14l3-2Zm0 0c10-9 12 3 3 2l-3-2Zm-2 2L6 22l5-2 1-6m2 0 4 8-5-2-1-6',
  },
  {
    slug: 'lanas',
    name: 'Lanas',
    color: '#448e74',
    background: '#edf7f1',
    path: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM6 6l12 12M4 10l10 10M10 4l10 10M7 19 19 7M12 20l8-8M4 12l8-8M20 15c4 0 3 6 1 7',
  },
  {
    slug: 'tijeras',
    name: 'Tijeras',
    color: '#527d9b',
    background: '#edf4f8',
    path: 'M9 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 9l13 12M8 15 21 3',
  },
];

type Suggestion = { id: string; name: string; kind: string; context: string; href: string };

function PanelContent() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const visible =
    pathname === '/' ||
    (pathname === '/products' &&
      !['category', 'groupId', 'typeId', 'search', 'tipo'].some((key) => params.has(key)));
  const [names, setNames] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    fetch('/api/products/categories', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((data: { slug: string; name: string }[]) => {
        if (Array.isArray(data))
          setNames(Object.fromEntries(data.map((category) => [category.slug, category.name])));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [visible]);

  useEffect(() => {
    const term = query.trim();
    setResults([]);
    setActive(-1);
    setError('');
    if (!term || !visible) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/catalog/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error();
          return response.json();
        })
        .then((data) => {
          if (!controller.signal.aborted) setResults(Array.isArray(data) ? data.slice(0, 4) : []);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError('No pudimos buscar. Intenta de nuevo.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, visible]);

  if (!visible) return null;

  const choose = (result: Suggestion) => {
    setOpen(false);
    router.push(result.href);
  };
  return (
    <section
      aria-label="Buscar y explorar el catálogo"
      className="border-b border-gray-100 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative border-b border-gray-100 py-4"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
          }}
        >
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (!loading && results.length) choose(results[active >= 0 ? active : 0]);
              else setOpen(true);
            }}
            className="flex items-center rounded-xl border border-gray-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-rose-100"
          >
            <input
              type="search"
              role="combobox"
              aria-label="Buscar en el catálogo"
              aria-autocomplete="list"
              aria-expanded={open && !!query.trim()}
              aria-controls="catalog-suggestions"
              aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined}
              value={query}
              maxLength={100}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpen(false);
                  setActive(-1);
                }
                if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && results.length) {
                  event.preventDefault();
                  setOpen(true);
                  setActive((index) =>
                    event.key === 'ArrowDown'
                      ? (index + 1) % results.length
                      : index <= 0
                        ? results.length - 1
                        : index - 1,
                  );
                }
              }}
              placeholder="Busca categorías, productos, tipos o tarjetas…"
              className="min-w-0 w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Ir al resultado de búsqueda"
              className="shrink-0 rounded-xl p-3 text-gray-900 hover:text-[var(--color-primary)]"
            >
              <Search size={22} strokeWidth={1.8} />
            </button>
          </form>
          {open && query.trim() && (
            <div className="absolute left-0 right-0 top-full z-40 rounded-xl border border-gray-200 bg-white shadow-xl">
              {loading ? (
                <p role="status" className="p-4 text-sm text-gray-500">
                  Buscando…
                </p>
              ) : error ? (
                <p role="alert" className="p-4 text-sm text-red-700">
                  {error}
                </p>
              ) : results.length ? (
                <ul
                  id="catalog-suggestions"
                  role="listbox"
                  aria-label="Coincidencias del catálogo"
                  className="py-1"
                >
                  {results.map((result, index) => (
                    <li key={`${result.kind}-${result.id}`} role="presentation">
                      <Link
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={active === index}
                        href={result.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 hover:bg-rose-50 ${active === index ? 'bg-rose-50' : ''}`}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">
                            {result.name}
                          </span>
                          <span className="block truncate text-xs text-gray-500">
                            {result.context}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
                          {result.kind}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p role="status" className="p-4 text-sm text-gray-500">
                  No encontramos coincidencias.
                </p>
              )}
            </div>
          )}
        </div>
        <nav
          aria-label="Categorías principales"
          className="scrollbar-hide flex snap-x overflow-x-auto py-3"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group flex w-[94px] shrink-0 snap-start flex-col items-center gap-2 border-r border-gray-100 px-3 py-1 sm:w-auto sm:flex-1"
            >
              <span
                style={{ color: category.color, backgroundColor: category.background }}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-110"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={category.path} />
                </svg>
              </span>
              <span className="text-center text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-800 group-hover:text-[var(--color-primary)] sm:text-[10px]">
                {names[category.slug] || category.name}
              </span>
            </Link>
          ))}
          <Link
            href="/categorias"
            className="group flex w-[94px] shrink-0 snap-start flex-col items-center gap-2 px-3 py-1 sm:w-auto sm:flex-1"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-rose-50 group-hover:text-rose-700">
              <Grid2X2 size={23} strokeWidth={1.4} />
            </span>
            <span className="text-center text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-800 sm:text-[10px]">
              Ver más categorías
            </span>
          </Link>
        </nav>
      </div>
    </section>
  );
}

export default function CatalogPanel() {
  return (
    <Suspense fallback={null}>
      <PanelContent />
    </Suspense>
  );
}
