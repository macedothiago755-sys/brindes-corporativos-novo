// Fonte única da verdade para a URL de categoria. Mantém todos os links internos
// (header, footer, grid, sidebar, breadcrumbs, sitemap) consistentes e facilita
// qualquer mudança futura no padrão de rota.
export const categoryPath = (slug: string) => `/categoria/${slug}`;
