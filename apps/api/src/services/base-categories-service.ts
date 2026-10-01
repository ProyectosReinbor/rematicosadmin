import { PrismaClient } from "@prisma/client";
import { BASE_CATEGORIES } from "../config/catalogCategories";

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

    if (!existing.icon) {
      await prisma.category.update({ where: { id: existing.id }, data: { icon: base.icon } });
      iconsFilled += 1;
    }
  }

  return { created, iconsFilled };
}
