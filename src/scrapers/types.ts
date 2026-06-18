export interface SelectorMap {
  /** Seletor do card/link de produto na página de listagem. */
  productLinkSelector: string;
  /** Seletor do botão "próxima página", se houver paginação clássica. */
  nextPageSelector?: string;
  /** Se true, a listagem usa scroll infinito em vez de paginação por link. */
  infiniteScroll?: boolean;
  /** Quantas vezes rolar a página ao detectar scroll infinito. */
  maxScrollSteps?: number;

  // Página de detalhe do produto
  nameSelector: string;
  codeSelector?: string;
  skuSelector?: string;
  brandSelector?: string;
  shortDescriptionSelector?: string;
  longDescriptionSelector?: string;
  mainImageSelector?: string;
  galleryImageSelector?: string;
  /** Seletor de uma linha de tabela/lista de características (ex: "Material: Inox"). */
  attributeRowSelector?: string;
}

export interface SupplierAdapter {
  key: string;
  name: string;
  /** Domínios em que este adapter sabe operar (apenas informativo/validação). */
  matchesUrl?: (url: string) => boolean;
  selectors: SelectorMap;
  /** Hook opcional para tratar peculiaridades do fornecedor (ex: atributos fora do padrão). */
  parseExtraAttributes?: (html: string) => Record<string, string>;
}

export interface ScrapedProduct {
  sourceUrl: string;
  nome: string;
  codigo?: string;
  sku?: string;
  marca?: string;
  categoria?: string;
  descricaoCurta?: string;
  descricaoLonga?: string;
  imagemPrincipal?: string;
  imagens: string[];
  dadosTecnicos: Record<string, string>;
}

export interface ScrapeError {
  sourceUrl?: string;
  produto?: string;
  motivo: string;
}

export interface ScrapeProgress {
  productsFound: number;
  productsImported: number;
  productsFailed: number;
}
