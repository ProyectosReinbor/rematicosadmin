import { z } from 'zod';
import { BASE_CATEGORIES } from '../config/catalogCategories';

const id = z.string().uuid();
const nullable = z.string().nullable();
const timestamps = { createdAt: z.coerce.date(), updatedAt: z.coerce.date() };
const category = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  description: nullable,
  imageUrl: nullable,
  icon: nullable,
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  ...timestamps,
});
const product = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  details: nullable,
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'ARCHIVED']),
  isFeatured: z.boolean(),
  categoryId: id,
  typeId: id.nullable(),
  ...timestamps,
});
export const backupSchema = z.object({
  format: z.literal('rematico-catalog'),
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  categories: z.array(category),
  groups: z.array(z.object({ id, name: z.string().min(1), categoryId: id })),
  types: z.array(z.object({ id, name: z.string().min(1), groupId: id })),
  products: z.array(product),
  images: z.array(
    z.object({
      id,
      productId: id,
      url: z.string(),
      altText: nullable,
      sortOrder: z.number().int(),
      isPrimary: z.boolean(),
      createdAt: z.coerce.date(),
    }),
  ),
  options: z.array(z.object({ id, productId: id, name: z.string(), sortOrder: z.number().int() })),
  values: z.array(z.object({ id, optionId: id, value: z.string() })),
  variants: z.array(
    z.object({
      id,
      productId: id,
      reference: nullable,
      attributes: z.record(z.any()),
      imageUrl: nullable,
      isAvailable: z.boolean(),
      ...timestamps,
    }),
  ),
  files: z.array(
    z.object({
      url: z.string(),
      data: z
        .string()
        .max(16 * 1024 * 1024)
        .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
    }),
  ),
});
export function uploadedFilename(url: string) {
  // Acepta URL de la API anterior, pero nunca rutas arbitrarias del sistema.
  const pathname = url.startsWith('/') ? url : new URL(url).pathname;
  const match = /^\/uploads\/([a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp|gif))$/i.exec(pathname);
  if (!match)
    throw new Error(
      'El respaldo contiene una imagen que no está guardada en el catálogo. Sube esa imagen al admin antes de exportar.',
    );
  return match[1];
}
export function validateBackup(input: unknown) {
  const b = backupSchema.parse(input);
  const unique = (rows: { id: string }[]) => {
    const ids = new Set(rows.map((r) => r.id));
    if (ids.size !== rows.length) throw new Error('Identificadores duplicados');
    return ids;
  };
  const categories = unique(b.categories),
    groups = unique(b.groups),
    types = unique(b.types),
    products = unique(b.products),
    options = unique(b.options);
  unique(b.images);
  unique(b.values);
  unique(b.variants);
  const requireRef = (ok: boolean) => {
    if (!ok) throw new Error('El respaldo contiene relaciones incompletas');
  };
  for (const base of BASE_CATEGORIES)
    requireRef(
      b.categories.some(
        (c) => c.slug === base.slug || (base.slug === 'confeccion' && c.slug === 'confaccion'),
      ),
    );
  for (const g of b.groups) requireRef(categories.has(g.categoryId));
  for (const t of b.types) requireRef(groups.has(t.groupId));
  for (const p of b.products) {
    requireRef(categories.has(p.categoryId) && (!p.typeId || types.has(p.typeId)));
    if (p.typeId)
      requireRef(
        b.groups.find((g) => g.id === b.types.find((t) => t.id === p.typeId)?.groupId)
          ?.categoryId === p.categoryId,
      );
  }
  for (const r of [...b.images, ...b.options, ...b.variants]) requireRef(products.has(r.productId));
  for (const v of b.values) requireRef(options.has(v.optionId));
  const files = new Set(b.files.map((f) => f.url));
  requireRef(files.size === b.files.length);
  for (const url of [
    ...b.categories.map((c) => c.imageUrl),
    ...b.images.map((i) => i.url),
    ...b.variants.map((v) => v.imageUrl),
  ].filter((u): u is string => !!u)) {
    uploadedFilename(url);
    requireRef(files.has(url));
  }
  for (const f of b.files) {
    uploadedFilename(f.url);
    requireRef(f.data.length > 0);
  }
  return b;
}
