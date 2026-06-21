-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "metaDescription" TEXT;

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");
