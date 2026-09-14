import { Router, Request, Response } from "express";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { authenticateToken, requireRole } from "../../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const imageSchema = z.object({ url: z.string().url(), altText: z.string().max(180).optional() });
const optionValueSchema = z.object({ value: z.string().min(1).max(60), imageUrl: z.string().url().optional() });
const optionSchema = z.object({ name: z.string().min(1).max(60), values: z.array(optionValueSchema).min(1) });
const productSchema = z.object({
  name: z.string().min(3).max(160), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().min(20).max(2000), details: z.string().max(3000).optional(), categoryId: z.string().uuid(),
  status: z.nativeEnum(ProductStatus).optional(), isFeatured: z.boolean().optional(),
  images: z.array(imageSchema).max(12).optional(),
  options: z.array(optionSchema).max(6).optional(),
});
const variantSchema = z.object({ reference: z.string().max(80).optional(), attributes: z.record(z.string().min(1).max(80)).default({}), imageUrl: z.string().url().optional(), isAvailable: z.boolean().default(true) });

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

const optionValueInclude = { values: true };
const productInclude = {
  category: true,
  images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
  options: { orderBy: { sortOrder: "asc" as const }, include: { values: true } },
  variants: { orderBy: { createdAt: "asc" as const } },
};

// ─── Public ────────────────────────────────────────
router.get("/categories", async (_req: Request, res: Response) => {
  res.json(await prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
});

router.get("/", async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const option = typeof req.query.option === "string" ? req.query.option.trim() : "";
  const optionValue = typeof req.query.optionValue === "string" ? req.query.optionValue.trim() : "";
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {}),
      ...(option && optionValue ? { options: { some: { name: { equals: option, mode: "insensitive" }, values: { some: { value: { equals: optionValue, mode: "insensitive" } } } } } } : {}),
    },
    include: productInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  res.json({ data: products });
});

router.get("/admin/list", authenticateToken, requireRole("ADMIN"), async (_req: Request, res: Response) => {
  res.json({ data: await prisma.product.findMany({ include: productInclude, orderBy: { updatedAt: "desc" } }) });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const product = await prisma.product.findFirst({ where: { slug: req.params.slug, status: "PUBLISHED" }, include: productInclude });
  if (!product) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Producto no encontrado" } });
  res.json(product);
});

// ─── Admin ─────────────────────────────────────────
router.use(authenticateToken, requireRole("ADMIN"));

// Categories
router.post("/categories", async (req: Request, res: Response) => {
  const parsed = z.object({ name: z.string().min(2).max(80), slug: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Categoría inválida", details: parsed.error.errors } });
  res.status(201).json(await prisma.category.create({ data: { name: parsed.data.name, slug: parsed.data.slug || slugify(parsed.data.name) } }));
});

// Create product
router.post("/", async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Datos de producto inválidos", details: parsed.error.errors } });
  const data = parsed.data;
  const product = await prisma.product.create({
    data: {
      name: data.name, slug: data.slug || slugify(data.name), description: data.description,
      details: data.details, categoryId: data.categoryId, status: data.status || "DRAFT", isFeatured: data.isFeatured || false,
      images: data.images ? { create: data.images.map((image, index) => ({ ...image, sortOrder: index, isPrimary: index === 0 })) } : undefined,
      options: data.options ? { create: data.options.map((option, index) => ({
        name: option.name, sortOrder: index,
        values: { create: option.values.map((v) => ({ value: v.value, imageUrl: v.imageUrl || null })) },
      })) } : undefined,
    },
    include: productInclude,
  });
  res.status(201).json(product);
});

// Full update product (name, description, details, categoryId, status, isFeatured)
router.put("/:id", async (req: Request, res: Response) => {
  const parsed = z.object({
    name: z.string().min(3).max(160).optional(),
    description: z.string().min(20).max(2000).optional(),
    details: z.string().max(3000).optional().nullable(),
    categoryId: z.string().uuid().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    isFeatured: z.boolean().optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: parsed.error.errors } });
  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) { updateData.name = data.name; updateData.slug = slugify(data.name); }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.details !== undefined) updateData.details = data.details;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  res.json(await prisma.product.update({ where: { id: req.params.id }, data: updateData, include: productInclude }));
});

// Legacy PATCH (backward compat)
router.patch("/:id", async (req: Request, res: Response) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Datos de producto inválidos", details: parsed.error.errors } });
  const { images: _images, options: _options, ...data } = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) { updateData.name = data.name; updateData.slug = slugify(data.name); }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.details !== undefined) updateData.details = data.details;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  res.json(await prisma.product.update({ where: { id: req.params.id }, data: updateData, include: productInclude }));
});

// Delete product
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// ─── Images ────────────────────────────────────────
router.post("/:id/images", async (req: Request, res: Response) => {
  const parsed = z.object({ images: z.array(imageSchema).min(1).max(12) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Imágenes inválidas", details: parsed.error.errors } });
  const count = await prisma.productImage.count({ where: { productId: req.params.id } });
  await prisma.productImage.createMany({ data: parsed.data.images.map((image, index) => ({ productId: req.params.id, ...image, sortOrder: count + index })) });
  res.status(201).json(await prisma.product.findUnique({ where: { id: req.params.id }, include: productInclude }));
});

router.put("/:id/images/reorder", async (req: Request, res: Response) => {
  const parsed = z.object({ imageIds: z.array(z.string().uuid()).min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Orden inválido" } });
  await prisma.$transaction(parsed.data.imageIds.map((imageId, index) =>
    prisma.productImage.update({ where: { id: imageId }, data: { sortOrder: index, isPrimary: index === 0 } })
  ));
  res.json(await prisma.product.findUnique({ where: { id: req.params.id }, include: productInclude }));
});

router.delete("/:id/images/:imageId", async (req: Request, res: Response) => {
  await prisma.productImage.delete({ where: { id: req.params.imageId } });
  res.status(204).end();
});

// ─── Options ───────────────────────────────────────
router.post("/:id/options", async (req: Request, res: Response) => {
  const parsed = z.object({ name: z.string().min(1).max(60), values: z.array(optionValueSchema).min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Atributo inválido", details: parsed.error.errors } });
  const count = await prisma.productOption.count({ where: { productId: req.params.id } });
  await prisma.productOption.create({
    data: {
      productId: req.params.id, name: parsed.data.name, sortOrder: count,
      values: { create: parsed.data.values.map((v) => ({ value: v.value, imageUrl: v.imageUrl || null })) },
    },
  });
  res.status(201).json(await prisma.product.findUnique({ where: { id: req.params.id }, include: productInclude }));
});

router.put("/:id/options/:optionId", async (req: Request, res: Response) => {
  const parsed = z.object({ name: z.string().min(1).max(60).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Atributo inválido" } });
  await prisma.productOption.update({ where: { id: req.params.optionId }, data: parsed.data });
  res.json(await prisma.product.findUnique({ where: { id: req.params.id }, include: productInclude }));
});

router.delete("/:id/options/:optionId", async (req: Request, res: Response) => {
  await prisma.productOption.delete({ where: { id: req.params.optionId } });
  res.status(204).end();
});

// Option values
router.put("/:id/options/:optionId/values/:valueId", async (req: Request, res: Response) => {
  const parsed = z.object({ value: z.string().min(1).max(60).optional(), imageUrl: z.string().url().optional().nullable() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Valor inválido" } });
  await prisma.optionValue.update({ where: { id: req.params.valueId }, data: parsed.data });
  res.json(await prisma.product.findUnique({ where: { id: req.params.id }, include: productInclude }));
});

router.post("/:id/options/:optionId/values", async (req: Request, res: Response) => {
  const parsed = z.object({ value: z.string().min(1).max(60), imageUrl: z.string().url().optional().nullable() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Valor inválido" } });
  await prisma.optionValue.create({ data: { optionId: req.params.optionId, value: parsed.data.value, imageUrl: parsed.data.imageUrl || null } });
  res.json(await prisma.product.findUnique({ where: { id: req.params.id }, include: productInclude }));
});

router.delete("/:id/options/:optionId/values/:valueId", async (req: Request, res: Response) => {
  await prisma.optionValue.delete({ where: { id: req.params.valueId } });
  res.status(204).end();
});

// ─── Variants ──────────────────────────────────────
router.post("/:id/variants", async (req: Request, res: Response) => {
  const parsed = variantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Variante inválida", details: parsed.error.errors } });
  const variant = await prisma.productVariant.create({ data: { productId: req.params.id, ...parsed.data } });
  res.status(201).json(variant);
});

router.delete("/:id/variants/:variantId", async (req: Request, res: Response) => {
  await prisma.productVariant.delete({ where: { id: req.params.variantId } });
  res.status(204).end();
});

export default router;
