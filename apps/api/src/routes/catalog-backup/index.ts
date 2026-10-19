import express, { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { mkdir, readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { uploadedFilename, validateBackup } from '../../services/catalog-backup';

const prisma = new PrismaClient();
const router = Router();
const uploads = path.join(__dirname, '..', '..', '..', 'uploads');
const run =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
router.use(authenticateToken, requireRole('ADMIN'));
router.use(
  rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }),
);
router.get(
  '/export',
  run(async (_req, res) => {
    const data = await prisma.$transaction(
      async (db) => ({
        categories: await db.category.findMany(),
        groups: await db.catalogGroup.findMany(),
        types: await db.catalogType.findMany(),
        products: await db.product.findMany(),
        images: await db.productImage.findMany(),
        options: await db.productOption.findMany(),
        values: await db.optionValue.findMany(),
        variants: await db.productVariant.findMany(),
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
    const urls = new Set(
      [
        ...data.categories.map((c) => c.imageUrl),
        ...data.images.map((i) => i.url),
        ...data.variants.map((v) => v.imageUrl),
      ].filter((u): u is string => !!u),
    );
    const files = [];
    try {
      for (const url of urls) {
        const image = await readFile(path.join(uploads, uploadedFilename(url)));
        files.push({ url, data: image.toString('base64') });
      }
      const backup = {
        format: 'rematico-catalog',
        version: 1,
        exportedAt: new Date().toISOString(),
        ...data,
        files,
      };
      validateBackup(backup);
      if (Buffer.byteLength(JSON.stringify(backup)) > 500 * 1024 * 1024)
        throw new Error('El catálogo supera el límite de respaldo de 500 MB.');
      res.setHeader('Cache-Control', 'no-store');
      res.json(backup);
    } catch (error) {
      res
        .status(422)
        .json({
          error: {
            message: `No se pudo crear un respaldo completo. Comprueba que todas las imágenes existan. ${error instanceof Error ? error.message : ''}`,
          },
        });
    }
  }),
);
// Solo este endpoint autenticado permite respaldos grandes; el resto conserva su límite.
router.post(
  '/import',
  express.json({ limit: '500mb' }),
  run(async (req, res) => {
    let backup;
    try {
      backup = validateBackup(req.body);
    } catch {
      return res
        .status(400)
        .json({
          error: {
            message:
              'Respaldo inválido, incompleto o de una versión incompatible. No se ha cambiado el catálogo.',
          },
        });
    }
    const created: string[] = [];
    const urls = new Map<string, string>();
    try {
      await mkdir(uploads, { recursive: true });
      for (const file of backup.files) {
        const name = `${randomUUID()}${path.extname(uploadedFilename(file.url))}`;
        const target = path.join(uploads, name);
        await writeFile(target, Buffer.from(file.data, 'base64'), { flag: 'wx' });
        created.push(target);
        urls.set(file.url, `/uploads/${name}`);
      }
      const imageUrl = (url: string | null) => (url ? urls.get(url)! : null);
      await prisma.$transaction(
        async (db) => {
          await db.optionValue.deleteMany();
          await db.productOption.deleteMany();
          await db.productVariant.deleteMany();
          await db.productImage.deleteMany();
          await db.product.deleteMany();
          await db.catalogType.deleteMany();
          await db.catalogGroup.deleteMany();
          await db.category.deleteMany();
          if (backup.categories.length)
            await db.category.createMany({
              data: backup.categories.map((c) => ({ ...c, imageUrl: imageUrl(c.imageUrl) })),
            });
          if (backup.groups.length) await db.catalogGroup.createMany({ data: backup.groups });
          if (backup.types.length) await db.catalogType.createMany({ data: backup.types });
          if (backup.products.length) await db.product.createMany({ data: backup.products });
          if (backup.images.length)
            await db.productImage.createMany({
              data: backup.images.map((i) => ({ ...i, url: imageUrl(i.url)! })),
            });
          if (backup.options.length) await db.productOption.createMany({ data: backup.options });
          if (backup.values.length) await db.optionValue.createMany({ data: backup.values });
          if (backup.variants.length)
            await db.productVariant.createMany({
              data: backup.variants.map((v) => ({ ...v, imageUrl: imageUrl(v.imageUrl) })),
            });
        },
        { timeout: 120000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      res.json({
        categories: backup.categories.length,
        products: backup.products.length,
        images: backup.images.length,
      });
    } catch (error) {
      await Promise.allSettled(created.map((file) => unlink(file)));
      throw error;
    }
  }),
);
export default router;
