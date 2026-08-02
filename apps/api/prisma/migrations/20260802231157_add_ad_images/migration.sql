-- CreateTable
CREATE TABLE "ad_images" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "original_url" TEXT NOT NULL,
    "no_bg_url" TEXT,
    "final_url" TEXT,
    "product_type" TEXT,
    "colors" JSONB,
    "category" TEXT,
    "prompt" TEXT,
    "text_style" TEXT,
    "template" TEXT,
    "provider" TEXT,
    "generation_time" INTEGER,
    "cost" DECIMAL(10,6),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_images_user_id_idx" ON "ad_images"("user_id");

-- CreateIndex
CREATE INDEX "ad_images_status_idx" ON "ad_images"("status");

-- CreateIndex
CREATE INDEX "ad_images_created_at_idx" ON "ad_images"("created_at");
