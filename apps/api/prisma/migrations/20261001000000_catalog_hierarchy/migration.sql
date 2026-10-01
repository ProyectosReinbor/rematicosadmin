-- Conserva las tarjetas antiguas: type_id queda NULL hasta clasificarlas en el administrador.
CREATE TABLE "catalog_groups" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "category_id" TEXT NOT NULL, CONSTRAINT "catalog_groups_pkey" PRIMARY KEY ("id"));
CREATE TABLE "catalog_types" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "group_id" TEXT NOT NULL, CONSTRAINT "catalog_types_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "catalog_groups_category_id_name_key" ON "catalog_groups"("category_id", "name");
CREATE UNIQUE INDEX "catalog_types_group_id_name_key" ON "catalog_types"("group_id", "name");
ALTER TABLE "catalog_groups" ADD CONSTRAINT "catalog_groups_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "catalog_types" ADD CONSTRAINT "catalog_types_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "catalog_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD COLUMN "type_id" TEXT;
ALTER TABLE "products" ADD CONSTRAINT "products_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "catalog_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
UPDATE "categories" SET "slug" = 'confeccion' WHERE "slug" = 'confaccion' AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'confeccion');
UPDATE "categories" SET "icon" = NULL WHERE "slug" IN ('alfileres', 'accesorios-y-herramientas');
UPDATE "products" SET "category_id" = (SELECT "id" FROM "categories" WHERE "slug" = 'confeccion') WHERE "category_id" IN (SELECT "id" FROM "categories" WHERE "slug" = 'confaccion') AND EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'confeccion');
UPDATE "categories" SET "is_active" = false, "icon" = NULL WHERE "slug" = 'confaccion' AND EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'confeccion');

-- La unidad existía en schema.prisma pero no en las migraciones históricas.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "unit" TEXT NOT NULL DEFAULT 'UNIDAD';
