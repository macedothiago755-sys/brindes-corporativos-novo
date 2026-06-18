import type { SupplierAdapter } from "../types";

/**
 * XBZ Brindes (xbzbrindes.com.br)
 *
 * Seletores de detalhe do produto confirmados a partir do HTML real de
 * https://www.xbzbrindes.com.br/09252 (Copo Inox 500ml com Abridor).
 *
 * Seletores de listagem confirmados a partir do HTML real de
 * https://www.xbzbrindes.com.br/brindes/Copos: os cards usam
 * "div.thumbnail.prod .img-prod a" e a categoria não tem paginação nem
 * scroll infinito — todos os produtos já vêm renderizados na primeira
 * carga. `nextPageSelector` foi mantido como fallback inofensivo para
 * outras categorias do mesmo site que possam paginar; se nenhum elemento
 * correspondente existir, o engine simplesmente ignora e encerra a coleta.
 */
export const xbzBrindesAdapter: SupplierAdapter = {
  key: "xbz-brindes",
  name: "XBZ Brindes",
  matchesUrl: (url) => url.includes("xbzbrindes.com.br"),
  selectors: {
    // Listagem da categoria
    productLinkSelector: "div.thumbnail.prod .img-prod a",
    nextPageSelector: ".paginacao a.next, .pagination a[rel='next'], a.proxima",
    infiniteScroll: false,

    // Página de detalhe do produto
    nameSelector: "p.produto-nome",
    codeSelector: "#item_referencia",
    shortDescriptionSelector: ".caracas .desc:first-child .desc-sub",
    longDescriptionSelector: ".caracas .desc:first-child .desc-sub",
    mainImageSelector: ".detalhe-img img.media-object, .detalhe-img .js-imagemprincipal img",
    galleryImageSelector: ".min_detalhe_img img.img_detalhe",
    // Cada bloco ".desc" (exceto o primeiro, que é a descrição) é um par "Atributo : Valor".
    attributeRowSelector: ".caracas .desc:not(:first-child)",
  },
};
