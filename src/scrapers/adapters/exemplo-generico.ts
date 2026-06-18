import type { SupplierAdapter } from "../types";

/**
 * Adapter de exemplo/template. Copie este arquivo para criar um novo fornecedor:
 * 1. Abra a categoria do fornecedor no navegador e inspecione o HTML.
 * 2. Preencha os seletores abaixo (CSS selectors normais).
 * 3. Registre o adapter em `src/scrapers/adapters/index.ts`.
 */
export const exemploGenericoAdapter: SupplierAdapter = {
  key: "exemplo-generico",
  name: "Fornecedor Exemplo",
  matchesUrl: (url) => url.includes("fornecedor-exemplo.com"),
  selectors: {
    // Listagem da categoria
    productLinkSelector: "a.product-card__link",
    nextPageSelector: "a.pagination__next",
    infiniteScroll: false,
    maxScrollSteps: 15,

    // Página de detalhe do produto
    nameSelector: "h1.product-title",
    codeSelector: ".product-code",
    skuSelector: ".product-sku",
    brandSelector: ".product-brand",
    shortDescriptionSelector: ".product-summary",
    longDescriptionSelector: ".product-description",
    mainImageSelector: ".product-gallery img.main",
    galleryImageSelector: ".product-gallery img.thumb",
    attributeRowSelector: ".product-attributes tr, .product-attributes li",
  },
};
