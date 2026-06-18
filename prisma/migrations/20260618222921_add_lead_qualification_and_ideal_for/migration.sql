-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "idealFor" TEXT[];

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "objetivo" TEXT,
ADD COLUMN     "prazo" TEXT;
