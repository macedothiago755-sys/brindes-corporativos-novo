-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('ABERTO', 'EM_ANALISE', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ACCESS', 'EXPORT', 'DELETE', 'ANONYMIZE');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "consentObrigatorioAceito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentObrigatorioVersion" TEXT,
ADD COLUMN     "consentObrigatorioDate" TIMESTAMP(3),
ADD COLUMN     "consentMarketingAceito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentMarketingVersion" TEXT,
ADD COLUMN     "consentMarketingDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Quote_couponCode_idx" ON "Quote"("couponCode");

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "empresa" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "couponCode" TEXT,
    "consentObrigatorioAceito" BOOLEAN NOT NULL DEFAULT false,
    "consentObrigatorioVersion" TEXT,
    "consentObrigatorioDate" TIMESTAMP(3),
    "consentMarketingAceito" BOOLEAN NOT NULL DEFAULT false,
    "consentMarketingVersion" TEXT,
    "consentMarketingDate" TIMESTAMP(3),
    "anonymizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateTable
CREATE TABLE "CookieConsent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "consentStatus" TEXT NOT NULL,
    "acceptedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "policyVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CookieConsent_sessionId_idx" ON "CookieConsent"("sessionId");

-- CreateTable
CREATE TABLE "DataDeletionRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "mensagem" TEXT,
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'ABERTO',
    "notasAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataDeletionRequest_email_idx" ON "DataDeletionRequest"("email");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_status_idx" ON "DataDeletionRequest"("status");

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_idx" ON "AuditLog"("targetType");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
