-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('PENDENTE', 'EM_EXECUCAO', 'CONCLUIDO', 'CONCLUIDO_COM_ERROS', 'FALHOU');

-- CreateEnum
CREATE TYPE "ImportedProductStatus" AS ENUM ('IMPORTADO', 'ERRO', 'PROMOVIDO', 'IGNORADO');

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "adapterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "categoryUrl" TEXT NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'PENDENTE',
    "productsFound" INTEGER NOT NULL DEFAULT 0,
    "productsImported" INTEGER NOT NULL DEFAULT 0,
    "productsFailed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedProduct" (
    "id" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "sku" TEXT,
    "categoria" TEXT,
    "marca" TEXT,
    "descricaoCurta" TEXT,
    "descricaoLonga" TEXT,
    "descricaoIA" TEXT,
    "dadosTecnicos" JSONB NOT NULL DEFAULT '{}',
    "imagemPrincipal" TEXT,
    "imagens" JSONB NOT NULL DEFAULT '[]',
    "status" "ImportedProductStatus" NOT NULL DEFAULT 'IMPORTADO',
    "promotedProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportError" (
    "id" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "produto" TEXT,
    "motivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportError_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedProduct" ADD CONSTRAINT "ImportedProduct_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportError" ADD CONSTRAINT "ImportError_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
