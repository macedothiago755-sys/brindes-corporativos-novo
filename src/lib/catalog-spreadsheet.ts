// Mapeamento compartilhado entre exportação e importação da planilha de catálogo.
// Mantém os rótulos legíveis (PT-BR) usados no admin sincronizados com os enums
// do Prisma, garantindo um round-trip consistente (exportar → editar → reimportar).

export const OBJECTIVE_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  EVENTO: "Evento corporativo",
  CLIENTE_VIP: "Presente cliente VIP",
  FEIRA: "Feira/exposição",
  PREMIACAO: "Premiação",
};

export const PROFILE_LABELS: Record<string, string> = {
  ECONOMICO: "Econômico",
  INTERMEDIARIO: "Intermediário",
  PREMIUM: "Premium",
};

export const PRICE_TIER_LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  MEDIO: "Médio",
  ALTO: "Alto",
};

export const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  RASCUNHO: "Rascunho",
  INDISPONIVEL: "Indisponível",
};

// Normaliza um texto para comparação tolerante (sem acento, minúsculo, sem espaços extras).
function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Constrói um parser reverso (rótulo OU código → código do enum) tolerante a acento/caixa.
function buildReverseLookup(labels: Record<string, string>) {
  const map = new Map<string, string>();
  for (const [code, label] of Object.entries(labels)) {
    map.set(normalize(code), code);
    map.set(normalize(label), code);
  }
  return (value: string): string | undefined => map.get(normalize(value));
}

export const parseObjective = buildReverseLookup(OBJECTIVE_LABELS);
export const parseProfile = buildReverseLookup(PROFILE_LABELS);
export const parsePriceTier = buildReverseLookup(PRICE_TIER_LABELS);
export const parseStatus = buildReverseLookup(STATUS_LABELS);

// Colunas da planilha de catálogo, na ordem em que aparecem.
// A coluna "ID" é a chave para atualizar produtos existentes na reimportação.
export const CATALOG_COLUMNS = [
  "ID",
  "Nome",
  "SKU",
  "Código do Fornecedor",
  "Categoria",
  "Marca",
  "Status",
  "Preço",
  "Quantidade mínima",
  "Cor",
  "Material",
  "Tags",
  "Meta Título",
  "Meta Descrição",
  "Objetivos Compatíveis",
  "Perfil",
  "Faixa de Preço",
] as const;
