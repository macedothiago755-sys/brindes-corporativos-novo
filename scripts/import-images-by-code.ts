/**
 * Importa imagens de produtos a partir de um .zip do fornecedor, organizado
 * como <codigo>/arquivo.jpg dentro do arquivo.
 *
 * Lê o .zip diretamente em Node (em vez de pedir extração manual via
 * Expand-Archive/PowerShell) porque entradas de zip podem ter nomes de pasta
 * com espaço/caractere no fim, que o Windows recusa ao extrair para disco
 * ("Não foi possível localizar uma parte do caminho").
 *
 * Para cada pasta dentro do zip, localiza o Product (já promovido) ou o
 * ImportedProduct (ainda em revisão) cujo código de fornecedor é exatamente
 * igual ao nome da pasta (já normalizado), copia as imagens para
 * public/products/<codigo>/ e atualiza o campo de imagens. Produtos sem
 * pasta correspondente no zip não são alterados.
 *
 * Uso:
 *   npx tsx scripts/import-images-by-code.ts <arquivo.zip> [--dry-run]
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import unzipper from "unzipper";
import { prisma } from "@/lib/prisma";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function sanitizeSegment(segment: string) {
  return segment.trim().replace(/[.\s]+$/, "");
}

async function main() {
  const zipPath = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");

  if (!zipPath) {
    console.error("Uso: npx tsx scripts/import-images-by-code.ts <arquivo.zip> [--dry-run]");
    process.exit(1);
  }

  const directory = await unzipper.Open.file(zipPath);

  const byCode = new Map<string, typeof directory.files>();
  for (const file of directory.files) {
    if (file.type !== "File") continue;
    const parts = file.path.split("/").filter(Boolean);
    if (parts.length < 2) continue;
    const codigo = sanitizeSegment(parts[0]);
    const filename = sanitizeSegment(parts[parts.length - 1]);
    if (!IMAGE_EXT.test(filename)) continue;

    const list = byCode.get(codigo) ?? [];
    list.push(file);
    byCode.set(codigo, list);
  }

  const summary = { productsUpdated: 0, importedUpdated: 0, notFound: 0, totalImages: 0 };

  for (const [codigo, files] of byCode) {
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

    for (const file of files.sort((a, b) => a.path.localeCompare(b.path))) {
      const filename = sanitizeSegment(file.path.split("/").filter(Boolean).pop()!);
      const url = `/products/${codigo}/${filename}`;
      urls.push(url);

      if (!dryRun) {
        await mkdir(destDir, { recursive: true });
        const buffer = await file.buffer();
        await writeFile(path.join(destDir, filename), buffer);
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
