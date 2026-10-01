import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BASE_CATEGORIES } from "../src/config/catalogCategories";

const prisma = new PrismaClient();

async function seedAdminUser() {
  const email = "admin@rematicos.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user created: ${user.email} (password: ${password})`);
  console.log("IMPORTANT: Change this password after first login!");
}

async function seedBaseCategories() {
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
      console.log(`Category created: ${base.name} ${base.icon}`);
      continue;
    }

    if (!existing.icon) {
      await prisma.category.update({ where: { id: existing.id }, data: { icon: base.icon } });
      console.log(`Category icon filled: ${base.name} ${base.icon}`);
    }
  }
}

async function main() {
  await seedAdminUser();
  await seedBaseCategories();
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
