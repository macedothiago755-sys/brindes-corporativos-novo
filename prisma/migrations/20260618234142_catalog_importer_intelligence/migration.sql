-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "requestedById" TEXT;

-- AlterTable
ALTER TABLE "ImportedProduct" ADD COLUMN     "preco" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "ImportJob_requestedById_idx" ON "ImportJob"("requestedById");

-- CreateIndex
CREATE INDEX "ImportedProduct_codigo_idx" ON "ImportedProduct"("codigo");

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
