/**
 * Importa imagens de produtos a partir de uma pasta extraída de um .zip do
 * fornecedor, organizada como <pastaOrigem>/<codigo>/arquivo.jpg.
 *
 * Para cada subpasta, localiza o Product (já promovido) ou o ImportedProduct
 * (ainda em revisão) cujo código de fornecedor é exatamente igual ao nome da
 * pasta, copia as imagens para public/products/<codigo>/ e atualiza o campo
 * de imagens. Não sobrescreve produtos cujo código não bate com nenhuma
 * pasta (mantém imagens já cadastradas/ajustadas no admin).
 *
 * Uso:
 *   npx tsx scripts/import-images-by-code.ts <pastaExtraida> [--dry-run]
 */
import { readdir, mkdir, copyFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

async function main() {
  const sourceDir = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");

  if (!sourceDir) {
    console.error("Uso: npx tsx scripts/import-images-by-code.ts <pastaExtraida> [--dry-run]");
    process.exit(1);
  }

  const codeFolders = await readdir(sourceDir, { withFileTypes: true });
  const summary = { productsUpdated: 0, importedUpdated: 0, notFound: 0, totalImages: 0 };

  for (const entry of codeFolders) {
    if (!entry.isDirectory()) continue;
    const codigo = entry.name.trim();
    const folderPath = path.join(sourceDir, codigo);

    const files = (await readdir(folderPath)).filter((f) => IMAGE_EXT.test(f)).sort();
    if (files.length === 0) continue;

    const product = await prisma.product.findFirst({ where: { supplierCode: codigo } });
    const importedProduct = product
      ? null
      : await prisma.importedProduct.findFirst({
          where: { codigo, status: { not: "PROMOVIDO" } },
          orderBy: { createdAt: "desc" },
        });

    if (!product && !importedProduct) {
      summary.notFound++;
      continue;
    }

    const destDir = path.join(process.cwd(), "public", "products", codigo);
    const urls: string[] = [];

    for (const file of files) {
      const destPath = path.join(destDir, file);
      const url = `/products/${codigo}/${file}`;
      urls.push(url);

      if (!dryRun) {
        await mkdir(destDir, { recursive: true });
        await copyFile(path.join(folderPath, file), destPath);
      }
    }

    summary.totalImages += urls.length;

    if (product) {
      console.log(`[Product] ${codigo} -> ${product.name} (${urls.length} imagens)`);
      if (!dryRun) {
        await prisma.product.update({ where: { id: product.id }, data: { images: urls } });
      }
      summary.productsUpdated++;
    } else if (importedProduct) {
      console.log(`[ImportedProduct] ${codigo} -> ${importedProduct.nome} (${urls.length} imagens)`);
      if (!dryRun) {
        await prisma.importedProduct.update({
          where: { id: importedProduct.id },
          data: { imagemPrincipal: urls[0], imagens: urls },
        });
      }
      summary.importedUpdated++;
    }
  }

  console.log("\nResumo:", summary);
  if (dryRun) console.log("(--dry-run: nada foi gravado em disco ou no banco)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
