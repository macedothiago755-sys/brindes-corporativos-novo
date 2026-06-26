import type { SupplierAdapter, ScrapedProduct, ScrapeError } from "@/scrapers/types";
import { runCrawl } from "@/scrapers/engine";

export interface ImportRunOptions {
  categoryUrl: string;
  concurrency?: number;
  onProgress?: (found: number) => void;
  onProductScraped?: (product: ScrapedProduct) => Promise<void> | void;
  onProductError?: (error: ScrapeError) => Promise<void> | void;
}

/**
 * Fonte de dados de uma importação. O scraper (Playwright + Cheerio) é a
 * única implementação hoje, mas qualquer fonte futura (planilha, XML, API
 * de um fornecedor) pode implementar a mesma interface sem mudar o restante
 * do fluxo de importação.
 */
export interface ImportProvider {
  run(options: ImportRunOptions): Promise<{ links: string[] }>;
}

/** Provider que varre a listagem do fornecedor via o motor de scraping existente. */
export function createScrapeProvider(adapter: SupplierAdapter): ImportProvider {
  return {
    run(options) {
      return runCrawl({ ...options, adapter });
    },
  };
}
