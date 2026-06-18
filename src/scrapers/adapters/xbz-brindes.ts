import type { SupplierAdapter } from "../types";

/**
 * XBZ Brindes (xbzbrindes.com.br)
 *
 * Seletores de detalhe do produto confirmados a partir do HTML real de
 * https://www.xbzbrindes.com.br/09252 (Copo Inox 500ml com Abridor).
 *
 * Seletores de listagem (productLinkSelector/paginação) baseados no card
 * "div.thumbnail.prod" visto na seção "Produtos relacionados" da própria
 * página de produto — o mesmo componente costuma ser reaproveitado na
 * grade de categoria neste tipo de site. Ainda não validados contra o HTML
 * real de /brindes/Copos: se a paginação não for detectada corretamente,
 * envie o HTML da página de categoria para ajustar `nextPageSelector` /
 * `infiniteScroll`.
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
