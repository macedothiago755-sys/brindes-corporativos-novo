import { chromium, type Browser, type Page } from "playwright";
import * as cheerio from "cheerio";
import type { SupplierAdapter, ScrapedProduct, ScrapeError } from "./types";
import { cleanInline, cleanText, normalizeColor, normalizeDimensions, resolveUrl } from "./utils/clean";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(minMs = 400, maxMs = 1100) {
  return sleep(minMs + Math.random() * (maxMs - minMs));
}

export interface CrawlOptions {
  categoryUrl: string;
  adapter: SupplierAdapter;
  concurrency?: number;
  onProgress?: (found: number) => void;
  onProductScraped?: (product: ScrapedProduct) => Promise<void> | void;
  onProductError?: (error: ScrapeError) => Promise<void> | void;
}

/** Coleta todos os links de produto de uma categoria, lidando com paginação e scroll infinito. */
async function collectProductLinks(page: Page, categoryUrl: string, adapter: SupplierAdapter): Promise<string[]> {
  const { selectors } = adapter;
  const links = new Set<string>();

  await page.goto(categoryUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await randomDelay();

  if (selectors.infiniteScroll) {
    const maxSteps = selectors.maxScrollSteps ?? 15;
    let previousCount = -1;
    for (let step = 0; step < maxSteps; step++) {
      const hrefs = await page.$$eval(selectors.productLinkSelector, (els) =>
        els.map((el) => (el as HTMLAnchorElement).href || el.getAttribute("href") || "")
      );
      hrefs.forEach((h) => h && links.add(h));

      if (links.size === previousCount) break; // não carregou nada novo, parar
      previousCount = links.size;

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await randomDelay(800, 1500);
    }
  } else {
    let currentUrl: string | null = categoryUrl;
    let safety = 0;
    while (currentUrl && safety < 200) {
      safety++;
      const hrefs = await page.$$eval(selectors.productLinkSelector, (els) =>
        els.map((el) => (el as HTMLAnchorElement).href || el.getAttribute("href") || "")
      );
      hrefs.forEach((h) => h && links.add(h));

      if (!selectors.nextPageSelector) break;
      const nextHandle = await page.$(selectors.nextPageSelector);
      if (!nextHandle) break;
      const isDisabled = await nextHandle.evaluate(
        (el) => el.hasAttribute("disabled") || el.classList.contains("disabled")
      );
      if (isDisabled) break;

      await nextHandle.click().catch(() => null);
      await randomDelay(900, 1700);
      currentUrl = page.url();
    }
  }

  return Array.from(links)
    .map((href) => resolveUrl(categoryUrl, href))
    .filter((href): href is string => Boolean(href));
}

function extractAttributes(
  $: cheerio.CheerioAPI,
  rowSelector: string | undefined
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!rowSelector) return result;

  const keywordMap: Record<string, string> = {
    material: "material",
    materiais: "material",
    cor: "cor",
    cores: "cor",
    color: "cor",
    dimensao: "dimensao",
    dimensão: "dimensao",
    dimensoes: "dimensao",
    dimensões: "dimensao",
    medidas: "dimensao",
    tamanho: "dimensao",
    peso: "peso",
    weight: "peso",
    capacidade: "capacidade",
    volume: "capacidade",
    acabamento: "acabamento",
    finish: "acabamento",
    personalizacao: "personalizacao",
    personalização: "personalizacao",
    impressao: "personalizacao",
    impressão: "personalizacao",
    gravacao: "personalizacao",
    gravação: "personalizacao",
  };

  $(rowSelector).each((_, el) => {
    const raw = cleanInline($(el).text());
    if (!raw) return;
    const [labelRaw, ...rest] = raw.split(/[:|–-]/);
    if (!labelRaw || rest.length === 0) return;
    const label = labelRaw.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!value) return;

    const matchedKey = Object.keys(keywordMap).find((k) => label.includes(k));
    const fieldKey = matchedKey ? keywordMap[matchedKey] : label.replace(/\s+/g, "_");

    let finalValue = value;
    if (fieldKey === "cor") finalValue = normalizeColor(value);
    if (fieldKey === "dimensao" || fieldKey === "peso" || fieldKey === "capacidade") {
      finalValue = normalizeDimensions(value);
    }

    result[fieldKey] = finalValue;
  });

  return result;
}

async function scrapeProductPage(
  page: Page,
  url: string,
  adapter: SupplierAdapter
): Promise<ScrapedProduct> {
  const { selectors } = adapter;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await randomDelay();

  const html = await page.content();
  const $ = cheerio.load(html);

  const nome = cleanInline($(selectors.nameSelector).first().text());
  if (!nome) throw new Error("Nome do produto não encontrado (verifique o seletor nameSelector)");

  const codigo = selectors.codeSelector ? cleanInline($(selectors.codeSelector).first().text()) : undefined;
  const sku = selectors.skuSelector ? cleanInline($(selectors.skuSelector).first().text()) : undefined;
  const marca = selectors.brandSelector ? cleanInline($(selectors.brandSelector).first().text()) : undefined;
  const descricaoCurta = selectors.shortDescriptionSelector
    ? cleanInline($(selectors.shortDescriptionSelector).first().text())
    : undefined;
  const descricaoLonga = selectors.longDescriptionSelector
    ? cleanText($(selectors.longDescriptionSelector).first().html() ?? $(selectors.longDescriptionSelector).first().text())
    : undefined;

  const imagemPrincipal = selectors.mainImageSelector
    ? resolveUrl(url, $(selectors.mainImageSelector).first().attr("src") ?? $(selectors.mainImageSelector).first().attr("data-src")) ?? undefined
    : undefined;

  const imagens = new Set<string>();
  if (imagemPrincipal) imagens.add(imagemPrincipal);
  if (selectors.galleryImageSelector) {
    $(selectors.galleryImageSelector).each((_, el) => {
      const src = $(el).attr("src") ?? $(el).attr("data-src");
      const resolved = resolveUrl(url, src);
      if (resolved) imagens.add(resolved);
    });
  }

  const dadosTecnicos = extractAttributes($, selectors.attributeRowSelector);
  if (adapter.parseExtraAttributes) {
    Object.assign(dadosTecnicos, adapter.parseExtraAttributes(html));
  }

  return {
    sourceUrl: url,
    nome,
    codigo: codigo || undefined,
    sku: sku || undefined,
    marca: marca || undefined,
    descricaoCurta: descricaoCurta || undefined,
    descricaoLonga: descricaoLonga || undefined,
    imagemPrincipal,
    imagens: Array.from(imagens),
    dadosTecnicos,
  };
}

/** Roda N páginas Playwright em paralelo consumindo uma fila de URLs. */
async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  async function next(): Promise<void> {
    const index = cursor++;
    if (index >= items.length) return;
    await worker(items[index]);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()));
}

export async function runCrawl(options: CrawlOptions): Promise<{ links: string[] }> {
  const { categoryUrl, adapter, concurrency = 3, onProgress, onProductScraped, onProductError } = options;

  const browser: Browser = await chromium.launch({ headless: true });
  try {
    const listContext = await browser.newContext({ userAgent: USER_AGENT });
    const listPage = await listContext.newPage();
    const links = await collectProductLinks(listPage, categoryUrl, adapter);
    await listContext.close();

    onProgress?.(links.length);

    await runWithConcurrency(links, concurrency, async (url) => {
      const context = await browser.newContext({ userAgent: USER_AGENT });
      const page = await context.newPage();
      try {
        const product = await scrapeProductPage(page, url, adapter);
        await onProductScraped?.(product);
      } catch (err) {
        await onProductError?.({
          sourceUrl: url,
          motivo: err instanceof Error ? err.message : "Erro desconhecido ao processar produto",
        });
      } finally {
        await context.close();
        await randomDelay(300, 900);
      }
    });

    return { links };
  } finally {
    await browser.close();
  }
}
