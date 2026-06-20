-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "consentAceito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentVersion" TEXT,
ADD COLUMN     "consentDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "couponCode" TEXT,
    "consentAceito" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT,
    "consentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookieConsent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "consentStatus" TEXT NOT NULL,
    "acceptedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "CookieConsent_sessionId_idx" ON "CookieConsent"("sessionId");

-- CreateIndex
CREATE INDEX "Quote_couponCode_idx" ON "Quote"("couponCode");
