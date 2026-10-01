ALTER TABLE "categories" ADD COLUMN "icon" TEXT;

CREATE INDEX "categories_icon_idx" ON "categories"("icon");
