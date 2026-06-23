-- AlterEnum
ALTER TYPE "QuoteStatus" ADD VALUE 'APROVADO';
ALTER TYPE "QuoteStatus" ADD VALUE 'AJUSTE_SOLICITADO';

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'VIEW';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "approvalToken" TEXT,
ADD COLUMN     "feedbackNotes" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3);

-- Backfill existing rows with a unique token so the @unique constraint can be created.
UPDATE "Quote" SET "approvalToken" = "id" WHERE "approvalToken" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quote_approvalToken_key" ON "Quote"("approvalToken");
