import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { BASE_CATEGORIES } from '../config/catalogCategories';
import { uploadedFilename, validateBackup } from '../services/catalog-backup';

const mocks = vi.hoisted(() => {
  const db: Record<string, any> = {};
  for (const name of [
    'category',
    'catalogGroup',
    'catalogType',
    'product',
    'productImage',
    'productOption',
    'optionValue',
    'productVariant',
  ])
    db[name] = { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() };
  db.$transaction = vi.fn();
  return { db, readFile: vi.fn(), writeFile: vi.fn(), mkdir: vi.fn(), unlink: vi.fn() };
});
vi.mock('@prisma/client', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  PrismaClient: vi.fn(() => mocks.db),
}));
vi.mock('fs/promises', () => ({
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
  mkdir: mocks.mkdir,
  unlink: mocks.unlink,
}));
vi.mock('../middleware/auth', () => ({
  authenticateToken: (req: express.Request, res: express.Response, next: express.NextFunction) =>
    req.headers.authorization ? next() : res.sendStatus(401),
  requireRole: () => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    req.headers.authorization === 'ADMIN' ? next() : res.sendStatus(403),
}));
import router from '../routes/catalog-backup';
const app = express();
app.use('/backup', router);
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) =>
  res.status(500).json({ error: err.message }),
);
const stamp = new Date().toISOString();
function fixture() {
  const categories = BASE_CATEGORIES.map((c) => ({
    ...c,
    id: randomUUID(),
    imageUrl: null,
    isActive: true,
    createdAt: stamp,
    updatedAt: stamp,
  }));
  const group = { id: randomUUID(), name: 'Cintas', categoryId: categories[0].id };
  const type = { id: randomUUID(), name: 'Satinada', groupId: group.id };
  const product = {
    id: randomUUID(),
    name: 'Cinta roja',
    slug: 'cinta-roja',
    description: '',
    details: null,
    status: 'PUBLISHED',
    isFeatured: false,
    categoryId: categories[0].id,
    typeId: type.id,
    createdAt: stamp,
    updatedAt: stamp,
  };
  return {
    format: 'rematico-catalog',
    version: 1,
    exportedAt: stamp,
    categories,
    groups: [group],
    types: [type],
    products: [product],
    images: [
      {
        id: randomUUID(),
        productId: product.id,
        url: '/uploads/test.png',
        altText: 'Rojo',
        sortOrder: 0,
        isPrimary: true,
        createdAt: stamp,
      },
    ],
    options: [],
    values: [],
    variants: [],
    files: [{ url: '/uploads/test.png', data: Buffer.from('image-bytes').toString('base64') }],
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.db.$transaction.mockImplementation((fn: (db: any) => unknown) => fn(mocks.db));
});
describe('Respaldos del catálogo', () => {
  it('valida una jerarquía completa y conserva nombres, orden e imagen', () => {
    const b = validateBackup(fixture());
    expect(b.products[0].name).toBe('Cinta roja');
    expect(b.categories[0].sortOrder).toBe(10);
    expect(b.files[0].data).toBe(Buffer.from('image-bytes').toString('base64'));
  });
  it('rechaza relaciones rotas, imágenes ausentes y versiones desconocidas', () => {
    const b = fixture();
    expect(() => validateBackup({ ...b, files: [] })).toThrow();
    expect(() => validateBackup({ ...b, types: [] })).toThrow();
    expect(() => validateBackup({ ...b, version: 2 })).toThrow();
    expect(() => validateBackup({ ...b, categories: [] })).toThrow();
  });
  it('impide leer o escribir archivos fuera de uploads', () => {
    for (const url of [
      '/uploads/../../secret.png',
      '/uploads/a.svg',
      'file:///etc/passwd',
      '/logo.png',
    ])
      expect(() => uploadedFilename(url)).toThrow();
    expect(uploadedFilename('https://old.example/uploads/photo.jpg')).toBe('photo.jpg');
  });
  it('solo permite exportar e importar a administradores', async () => {
    for (const method of ['get', 'post'] as const) {
      const url = `/backup/${method === 'get' ? 'export' : 'import'}`;
      expect((await request(app)[method](url)).status).toBe(401);
      expect((await request(app)[method](url).set('Authorization', 'USER')).status).toBe(403);
    }
    expect(mocks.db.$transaction).not.toHaveBeenCalled();
  });
  it('exporta también los bytes de las imágenes', async () => {
    const b = fixture();
    const names = {
      category: 'categories',
      catalogGroup: 'groups',
      catalogType: 'types',
      product: 'products',
      productImage: 'images',
      productOption: 'options',
      optionValue: 'values',
      productVariant: 'variants',
    };
    for (const [model, key] of Object.entries(names))
      mocks.db[model].findMany.mockResolvedValue(b[key as keyof typeof b]);
    mocks.readFile.mockResolvedValue(Buffer.from('image-bytes'));
    const res = await request(app).get('/backup/export').set('Authorization', 'ADMIN');
    expect(res.status).toBe(200);
    expect(validateBackup(res.body).files[0].data).toBe(b.files[0].data);
  });
  it('no modifica datos si el archivo está incompleto', async () => {
    const b = fixture();
    const res = await request(app)
      .post('/backup/import')
      .set('Authorization', 'ADMIN')
      .send({ ...b, files: [] });
    expect(res.status).toBe(400);
    expect(mocks.db.$transaction).not.toHaveBeenCalled();
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });
  it('restaura todas las tablas en una transacción con imágenes nuevas', async () => {
    const b = fixture();
    const res = await request(app).post('/backup/import').set('Authorization', 'ADMIN').send(b);
    expect(res.status).toBe(200);
    expect(mocks.db.category.createMany).toHaveBeenCalled();
    expect(mocks.db.product.createMany.mock.calls[0][0].data[0].name).toBe('Cinta roja');
    const image = mocks.db.productImage.createMany.mock.calls[0][0].data[0];
    expect(image.url).toMatch(/^\/uploads\/[\w-]+\.png$/);
    expect(image.url).not.toBe('/uploads/test.png');
    expect(mocks.db.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: 'Serializable' }),
    );
  });
  it('limpia las imágenes nuevas si falla la transacción', async () => {
    mocks.db.$transaction.mockRejectedValue(new Error('DB failure'));
    const res = await request(app)
      .post('/backup/import')
      .set('Authorization', 'ADMIN')
      .send(fixture());
    expect(res.status).toBe(500);
    expect(mocks.unlink).toHaveBeenCalledWith(mocks.writeFile.mock.calls[0][0]);
  });
});
