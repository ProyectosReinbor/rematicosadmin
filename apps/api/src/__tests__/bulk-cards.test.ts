import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { randomUUID } from 'crypto';
const mocks = vi.hoisted(() => ({ type: vi.fn(), upsert: vi.fn(), transaction: vi.fn() }));
vi.mock('@prisma/client', async (original) => ({
  ...(await original<object>()),
  PrismaClient: vi.fn(() => ({
    catalogType: { findUnique: mocks.type },
    $transaction: mocks.transaction,
  })),
}));
vi.mock('../middleware/auth', () => ({
  authenticateToken: (req: express.Request, res: express.Response, next: express.NextFunction) =>
    req.headers.authorization ? next() : res.sendStatus(401),
  requireRole: () => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    req.headers.authorization === 'ADMIN' ? next() : res.sendStatus(403),
}));
import router from '../routes/products';
const app = express();
app.use(express.json());
app.use('/products', router);
app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) =>
  res.sendStatus(500),
);
const categoryId = randomUUID(),
  typeId = randomUUID();
const payload = () => ({
  categoryId,
  typeId,
  status: 'PUBLISHED',
  cards: [
    { id: randomUUID(), name: 'Cinta floral', image: { url: '/uploads/floral.jpg' } },
    { id: randomUUID(), name: 'Cinta satinada', image: { url: '/uploads/satinada.png' } },
  ],
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.type.mockResolvedValue({ group: { categoryId } });
  mocks.transaction.mockImplementation((fn: (db: unknown) => unknown) =>
    fn({ product: { upsert: mocks.upsert } }),
  );
});
describe('Creación múltiple de tarjetas', () => {
  it('requiere administrador', async () => {
    expect((await request(app).post('/products/bulk').send(payload())).status).toBe(401);
    expect(
      (await request(app).post('/products/bulk').set('Authorization', 'USER').send(payload()))
        .status,
    ).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it('rechaza un tipo de otra categoría sin escribir tarjetas', async () => {
    mocks.type.mockResolvedValue({ group: { categoryId: randomUUID() } });
    expect(
      (await request(app).post('/products/bulk').set('Authorization', 'ADMIN').send(payload()))
        .status,
    ).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it('rechaza un lote con nombre inválido o imágenes ausentes', async () => {
    const data = payload();
    data.cards[1].name = 'x';
    expect(
      (await request(app).post('/products/bulk').set('Authorization', 'ADMIN').send(data)).status,
    ).toBe(400);
    expect(
      (
        await request(app)
          .post('/products/bulk')
          .set('Authorization', 'ADMIN')
          .send({ ...payload(), cards: [] })
      ).status,
    ).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it('guarda cada imagen con su nombre y tipo dentro de una transacción', async () => {
    const data = payload();
    const res = await request(app).post('/products/bulk').set('Authorization', 'ADMIN').send(data);
    expect(res.status).toBe(201);
    expect(res.body.count).toBe(2);
    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    data.cards.forEach((card, index) =>
      expect(mocks.upsert.mock.calls[index][0]).toMatchObject({
        where: { id: card.id },
        update: {},
        create: {
          name: card.name,
          categoryId,
          typeId,
          status: 'PUBLISHED',
          images: { create: { url: card.image.url, altText: card.name, isPrimary: true } },
        },
      }),
    );
  });
  it('conserva los identificadores al reintentar para no duplicar un lote', async () => {
    const data = payload();
    for (let i = 0; i < 2; i++)
      expect(
        (await request(app).post('/products/bulk').set('Authorization', 'ADMIN').send(data)).status,
      ).toBe(201);
    expect(mocks.upsert.mock.calls[0][0].where).toEqual(mocks.upsert.mock.calls[2][0].where);
    expect(mocks.upsert.mock.calls[1][0].where).toEqual(mocks.upsert.mock.calls[3][0].where);
  });
});
