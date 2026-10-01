import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    category: { findUnique: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
    product: { count: vi.fn() },
    catalogGroup: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    catalogType: { count: vi.fn(), create: vi.fn(), delete: vi.fn() },
  })),
}));
vi.mock('../middleware/auth', () => ({
  authenticateToken: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.headers.authorization) return res.sendStatus(401);
    next();
  },
  requireRole: () => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers.authorization === 'USER') return res.sendStatus(403);
    next();
  },
}));
import router from '../routes/catalog';
import { PrismaClient } from '@prisma/client';
const db = vi.mocked(vi.mocked(PrismaClient).mock.results[0].value as PrismaClient);
const app = express();
app.use(express.json());
app.use('/catalog', router);
beforeEach(() => vi.resetAllMocks());
describe('Jerarquía del catálogo', () => {
  it.each(['confeccion', 'agujas', 'hilos', 'decoracion', 'lanas', 'tijeras'])(
    'protege %s aunque no tenga icono',
    async (slug) => {
      vi.mocked(db.category.findUnique).mockResolvedValue({ id: 'cat', slug, icon: null } as never);
      const res = await request(app)
        .delete('/catalog/categories/cat')
        .set('Authorization', 'ADMIN');
      expect(res.status).toBe(403);
      expect(db.category.delete).not.toHaveBeenCalled();
    },
  );
  it('requiere autenticación y rol administrador', async () => {
    expect((await request(app).post('/catalog/groups').send({ name: 'Cintas' })).status).toBe(401);
    expect(
      (
        await request(app)
          .post('/catalog/groups')
          .set('Authorization', 'USER')
          .send({ name: 'Cintas' })
      ).status,
    ).toBe(403);
  });
  it('impide eliminar una categoría que contiene productos', async () => {
    vi.mocked(db.category.findUnique).mockResolvedValue({ id: 'cat', slug: 'adicional' } as never);
    vi.mocked(db.product.count).mockResolvedValue(1);
    expect(
      (await request(app).delete('/catalog/categories/cat').set('Authorization', 'ADMIN')).status,
    ).toBe(409);
    expect(db.category.delete).not.toHaveBeenCalled();
  });
  it('permite eliminar una categoría adicional vacía', async () => {
    vi.mocked(db.category.findUnique).mockResolvedValue({ id: 'cat', slug: 'adicional' } as never);
    vi.mocked(db.product.count).mockResolvedValue(0);
    vi.mocked(db.catalogGroup.count).mockResolvedValue(0);
    expect(
      (await request(app).delete('/catalog/categories/cat').set('Authorization', 'ADMIN')).status,
    ).toBe(204);
  });
  it('impide eliminar un tipo con tarjetas', async () => {
    vi.mocked(db.product.count).mockResolvedValue(2);
    expect(
      (await request(app).delete('/catalog/types/type').set('Authorization', 'ADMIN')).status,
    ).toBe(409);
    expect(db.catalogType.delete).not.toHaveBeenCalled();
  });
  it('rechaza productos sin categoría válida', async () => {
    expect(
      (
        await request(app)
          .post('/catalog/groups')
          .set('Authorization', 'ADMIN')
          .send({ name: 'Cintas', categoryId: 'invalid' })
      ).status,
    ).toBe(400);
    expect(db.catalogGroup.create).not.toHaveBeenCalled();
  });
  it('devuelve el árbol público sin sesión', async () => {
    vi.mocked(db.category.findMany).mockResolvedValue([
      { name: 'Confección', groups: [{ name: 'Cintas', types: [{ name: 'Agua' }] }] },
    ] as never);
    const res = await request(app).get('/catalog/tree');
    expect(res.status).toBe(200);
    expect(res.body[0].groups[0].types[0].name).toBe('Agua');
  });
});
