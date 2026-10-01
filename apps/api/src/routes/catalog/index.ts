import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { isBaseCategory } from '../../config/catalogCategories';
const prisma = new PrismaClient();
const router = Router();
const run =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
const nameSchema = z.object({ name: z.string().trim().min(2).max(80) });
const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ error: { message } });
router.get(
  '/tree',
  run(async (req, res) => {
    res.json(
      await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          groups: { orderBy: { name: 'asc' }, include: { types: { orderBy: { name: 'asc' } } } },
        },
      }),
    );
  }),
);
router.get(
  '/search',
  run(async (req, res) => {
    const parsed = z.string().trim().min(1).max(100).safeParse(req.query.q);
    if (!parsed.success) return res.json([]);
    const name = { contains: parsed.data, mode: 'insensitive' as const };
    const results: { id: string; name: string; kind: string; context: string; href: string }[] = [];
    const url = (category: string, groupId?: string, typeId?: string) => {
      const params = new URLSearchParams({ category });
      if (groupId) params.set('groupId', groupId);
      if (typeId) params.set('typeId', typeId);
      return `/products?${params}`;
    };

    const categories = await prisma.category.findMany({
      where: { isActive: true, name },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: 4,
    });
    results.push(
      ...categories.map((c) => ({
        id: c.id,
        name: c.name,
        kind: 'Categoría',
        context: 'Explorar categoría',
        href: url(c.slug),
      })),
    );
    if (results.length < 4) {
      const groups = await prisma.catalogGroup.findMany({
        where: { name, category: { isActive: true } },
        include: { category: true },
        orderBy: { name: 'asc' },
        take: 4 - results.length,
      });
      results.push(
        ...groups.map((g) => ({
          id: g.id,
          name: g.name,
          kind: 'Producto',
          context: g.category.name,
          href: url(g.category.slug, g.id),
        })),
      );
    }
    if (results.length < 4) {
      const types = await prisma.catalogType.findMany({
        where: { name, group: { category: { isActive: true } } },
        include: { group: { include: { category: true } } },
        orderBy: { name: 'asc' },
        take: 4 - results.length,
      });
      results.push(
        ...types.map((t) => ({
          id: t.id,
          name: t.name,
          kind: 'Tipo',
          context: `${t.group.category.name} · ${t.group.name}`,
          href: url(t.group.category.slug, t.groupId, t.id),
        })),
      );
    }
    if (results.length < 4) {
      const cards = await prisma.product.findMany({
        where: { name, status: 'PUBLISHED', category: { isActive: true } },
        include: { category: true, type: { include: { group: true } } },
        orderBy: { name: 'asc' },
        take: 4 - results.length,
      });
      results.push(
        ...cards.map((c) => ({
          id: c.id,
          name: c.name,
          kind: 'Tarjeta',
          context: [c.category.name, c.type?.group.name, c.type?.name].filter(Boolean).join(' · '),
          href: `/products/${encodeURIComponent(c.slug)}`,
        })),
      );
    }
    res.json(results);
  }),
);
router.use(authenticateToken, requireRole('ADMIN'));
router.delete(
  '/categories/:id',
  run(async (req, res) => {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return fail(res, 404, 'Categoría no encontrada');
    if (isBaseCategory(category.slug))
      return fail(res, 403, 'Las seis categorías principales no se pueden eliminar');
    if (
      (await prisma.product.count({ where: { categoryId: category.id } })) ||
      (await prisma.catalogGroup.count({ where: { categoryId: category.id } }))
    )
      return fail(res, 409, 'Primero elimina o mueve los productos de esta categoría');
    await prisma.category.delete({ where: { id: category.id } });
    res.status(204).end();
  }),
);
for (const kind of ['groups', 'types'] as const) {
  router.post(
    `/${kind}`,
    run(async (req, res) => {
      const schema = nameSchema.extend(
        kind === 'groups' ? { categoryId: z.string().uuid() } : { groupId: z.string().uuid() },
      );
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        return fail(res, 400, 'Nombre y categoría o producto válidos son obligatorios');
      const data = parsed.data as { name: string; categoryId?: string; groupId?: string };
      const parent =
        kind === 'groups'
          ? await prisma.category.findUnique({ where: { id: data.categoryId } })
          : await prisma.catalogGroup.findUnique({ where: { id: data.groupId } });
      if (!parent) return fail(res, 404, 'No se encontró el elemento superior');
      res.status(201).json(
        kind === 'groups'
          ? await prisma.catalogGroup.create({
              data: { name: data.name, categoryId: data.categoryId! },
            })
          : await prisma.catalogType.create({
              data: { name: data.name, groupId: data.groupId! },
            }),
      );
    }),
  );
  router.put(
    `/${kind}/:id`,
    run(async (req, res) => {
      const parsed = nameSchema.safeParse(req.body);
      if (!parsed.success) return fail(res, 400, 'Nombre inválido');
      res.json(
        kind === 'groups'
          ? await prisma.catalogGroup.update({ where: { id: req.params.id }, data: parsed.data })
          : await prisma.catalogType.update({ where: { id: req.params.id }, data: parsed.data }),
      );
    }),
  );
  router.delete(
    `/${kind}/:id`,
    run(async (req, res) => {
      const count =
        kind === 'groups'
          ? await prisma.catalogType.count({ where: { groupId: req.params.id } })
          : await prisma.product.count({ where: { typeId: req.params.id } });
      if (count) return fail(res, 409, 'Primero elimina o mueve los elementos contenidos');
      if (kind === 'groups') await prisma.catalogGroup.delete({ where: { id: req.params.id } });
      else await prisma.catalogType.delete({ where: { id: req.params.id } });
      res.status(204).end();
    }),
  );
}
export default router;
