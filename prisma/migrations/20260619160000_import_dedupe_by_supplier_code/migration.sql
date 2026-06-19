-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "productsSkipped" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_supplierCode_idx" ON "Product"("supplierCode");
