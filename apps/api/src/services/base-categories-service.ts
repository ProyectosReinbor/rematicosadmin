import { PrismaClient } from '@prisma/client';
import { BASE_CATEGORIES } from '../config/catalogCategories';

/**
 * Inserta las categorías base definidas en código y completa el icono de las
 * que ya existan. Es idempotente: se puede ejecutar en cada arranque.
 *
 * No sobrescribe el nombre ni la descripción de las categorías que ya están en
 * la base de datos, para no perder los ajustes del administrador.
 */
export async function ensureBaseCategories(prisma: PrismaClient) {
  let created = 0;
  let iconsFilled = 0;

  const legacy = await prisma.category.findUnique({ where: { slug: 'confaccion' } });
  const canonical = await prisma.category.findUnique({ where: { slug: 'confeccion' } });
  if (legacy && canonical) {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: { categoryId: legacy.id },
        data: { categoryId: canonical.id },
      }),
      prisma.catalogGroup.updateMany({
        where: { categoryId: legacy.id },
        data: { categoryId: canonical.id },
      }),
      prisma.category.update({ where: { id: legacy.id }, data: { isActive: false, icon: null } }),
    ]);
  } else if (legacy) {
    await prisma.category.update({ where: { id: legacy.id }, data: { slug: 'confeccion' } });
  }
  await prisma.category.updateMany({
    where: { slug: { in: ['alfileres', 'accesorios-y-herramientas'] } },
    data: { icon: null },
  });

  for (const base of BASE_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: base.slug } });

    if (!existing) {
      await prisma.category.create({
        data: {
          slug: base.slug,
          name: base.name,
          description: base.description,
          icon: base.icon,
          sortOrder: base.sortOrder,
          isActive: true,
        },
      });
      created += 1;
      continue;
    }

    if (!existing.icon || !existing.isActive || existing.sortOrder !== base.sortOrder) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon: base.icon, isActive: true, sortOrder: base.sortOrder },
      });
      iconsFilled += 1;
    }
  }

  return { created, iconsFilled };
}
