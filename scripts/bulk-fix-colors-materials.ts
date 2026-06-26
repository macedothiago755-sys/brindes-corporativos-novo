/**
 * Preenche `colors` a partir do nome dos arquivos em `images` e `materials`
 * a partir de palavras-chave na `description`, para todo produto que esteja
 * com esses campos vazios. Produtos já ajustados manualmente (como o 01320)
 * são preservados — só roda em quem está vazio.
 *
 * Por padrão roda em modo dry-run (só mostra o que faria). Passe --apply
 * para gravar no banco.
 *
 * Uso:
 *   npx tsx scripts/bulk-fix-colors-materials.ts            (dry-run)
 *   npx tsx scripts/bulk-fix-colors-materials.ts --apply    (grava)
 */
import { prisma } from "@/lib/prisma";
import { extractColorsFromText, cleanInline } from "@/scrapers/utils/clean";

const MATERIAL_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /aço\s*inox|inoxid[áa]vel|stainless/i, label: "Aço Inox" },
  { regex: /\balum[ií]nio\b/i, label: "Alumínio" },
  { regex: /\bpolicarbonato\b/i, label: "Policarbonato" },
  { regex: /\b(plástico|plastico)\s*reciclad/i, label: "Plástico Reciclado" },
  { regex: /\bpl[áa]stico\b|\bPP\b|\bpolipropileno\b|\bABS\b/i, label: "Plástico" },
  { regex: /\bvidro\b/i, label: "Vidro" },
  { regex: /\bcer[âa]mica\b/i, label: "Cerâmica" },
  { regex: /\bporcelana\b/i, label: "Porcelana" },
  { regex: /\balgod[ãa]o\b/i, label: "Algodão" },
  { regex: /\bpoli[ée]ster\b/i, label: "Poliéster" },
  { regex: /\bnylon\b/i, label: "Nylon" },
  { regex: /couro\s*sint[ée]tico|courino/i, label: "Couro Sintético" },
  { regex: /\bcouro\b/i, label: "Couro" },
  { regex: /fibra\s*de\s*bambu|\bbambu\b/i, label: "Bambu" },
  { regex: /\bmadeira\b/i, label: "Madeira" },
  { regex: /\bMDF\b/i, label: "MDF" },
  { regex: /papel\s*kraft|\bkraft\b/i, label: "Papel Kraft" },
  { regex: /papel[ãa]o\s*reciclad/i, label: "Papelão Reciclado" },
  { regex: /\bsilicone\b/i, label: "Silicone" },
  { regex: /\bEVA\b/i, label: "EVA" },
  { regex: /\bneoprene\b/i, label: "Neoprene" },
  { regex: /\bjuta\b/i, label: "Juta" },
  { regex: /microfibra/i, label: "Microfibra" },
  { regex: /\bmetal\b/i, label: "Metal" },
  { regex: /\blat[ãa]o\b/i, label: "Latão" },
  { regex: /\bzamac\b/i, label: "Zamac" },
  { regex: /\bborracha\b/i, label: "Borracha" },
  { regex: /\btritan\b/i, label: "Tritan" },
  { regex: /\bPVC\b/i, label: "PVC" },
];

function extractMaterialsFromDescription(description: string): string[] {
  const text = cleanInline(description);
  const found = new Set<string>();
  for (const { regex, label } of MATERIAL_PATTERNS) {
    if (regex.test(text)) found.add(label);
  }
  return Array.from(found);
}

function extractColorsFromImages(images: string[]): string[] {
  const found = new Set<string>();
  for (const url of images) {
    const filename = url.split("/").pop() ?? "";
    for (const color of extractColorsFromText(filename)) found.add(color);
  }
  return Array.from(found);
}

async function main() {
  const apply = process.argv.includes("--apply");

  const products = await prisma.product.findMany({
    where: { OR: [{ colors: { isEmpty: true } }, { materials: { isEmpty: true } }] },
    select: { id: true, sku: true, name: true, images: true, description: true, colors: true, materials: true },
  });

  console.log(`Produtos com colors e/ou materials vazios: ${products.length}\n`);

  const summary = { colorsFilled: 0, materialsFilled: 0, untouched: 0 };

  for (const product of products) {
    const newColors = product.colors.length === 0 ? extractColorsFromImages(product.images) : null;
    const newMaterials = product.materials.length === 0 ? extractMaterialsFromDescription(product.description) : null;

    const willUpdateColors = newColors && newColors.length > 0;
    const willUpdateMaterials = newMaterials && newMaterials.length > 0;

    if (!willUpdateColors && !willUpdateMaterials) {
      summary.untouched++;
      continue;
    }

    console.log(
      `[${product.sku ?? product.id}] ${product.name}` +
        (willUpdateColors ? ` | cores: ${newColors!.join(", ")}` : "") +
        (willUpdateMaterials ? ` | materiais: ${newMaterials!.join(", ")}` : "")
    );

    if (willUpdateColors) summary.colorsFilled++;
    if (willUpdateMaterials) summary.materialsFilled++;

    if (apply) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          ...(willUpdateColors ? { colors: newColors } : {}),
          ...(willUpdateMaterials ? { materials: newMaterials } : {}),
        },
      });
    }
  }

  console.log("\nResumo:", summary);
  console.log(apply ? "Gravado no banco." : "(dry-run: nada foi gravado — rode com --apply para gravar)");
}

main()
  .catch((err) => {
    console.error("Falha no ajuste em massa:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
