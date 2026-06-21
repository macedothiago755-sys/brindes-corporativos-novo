import { normalizeCategoryName } from "@/components/site/category-icons";

const categoryCopy: Record<string, string> = {
  // Categorias oficiais (FASE 10)
  "blocos e cadernetas": "Blocos e cadernetas personalizados para empresas",
  "bolsas termicas": "Bolsas térmicas personalizadas para empresas",
  canecas: "Canecas personalizadas para empresas",
  canetas: "Canetas personalizadas para empresas",
  chaveiros: "Chaveiros personalizados para empresas",
  "conjuntos executivos": "Conjuntos executivos personalizados para empresas",
  cozinha: "Brindes de cozinha personalizados para empresas",
  "cuidados pessoais": "Brindes de cuidados pessoais para empresas",
  escritorio: "Brindes de escritório personalizados para empresas",
  esportes: "Brindes esportivos personalizados para empresas",
  ferramentas: "Ferramentas personalizadas para empresas",
  "guarda-chuva": "Guarda-chuvas personalizados para empresas",
  informatica: "Brindes de informática personalizados para empresas",
  "kit churrasco": "Kits de churrasco personalizados para empresas",
  "kit queijo": "Kits de queijo personalizados para empresas",
  "linha ecologica": "Brindes ecológicos personalizados para empresas",
  "linha feminina": "Brindes da linha feminina para empresas",
  "linha masculina": "Brindes da linha masculina para empresas",
  "linha pet": "Brindes pet personalizados para empresas",
  "mochilas e bolsas": "Mochilas e bolsas personalizadas para empresas",
  necessaires: "Nécessaires personalizadas para empresas",
  "sacolas e sacochilas": "Ecobags e sacolas personalizadas para empresas",
  "squeezes e garrafas": "Squeezes e garrafas personalizadas para empresas",
  // Categorias legadas (mantidas como fallback caso ainda sejam exibidas)
  brinquedos: "Brinquedos personalizados para empresas",
  "casa e decoracao": "Casa e decoração personalizados para empresas",
  copos: "Copos personalizados para empresas",
  espelhos: "Espelhos personalizados para empresas",
  esporte: "Brindes esportivos personalizados para empresas",
  eventos: "Brindes para eventos corporativos",
  "kits corporativos": "Kits corporativos personalizados",
  "moda e estilo": "Moda e estilo personalizados para empresas",
  petisqueiras: "Petisqueiras personalizadas para empresas",
  plaquinhas: "Plaquinhas personalizadas para empresas",
  premium: "Brindes premium para empresas",
  sustentaveis: "Brindes sustentáveis para empresas",
  tecnologia: "Brindes de tecnologia personalizados para empresas",
  tabuas: "Tábuas personalizadas para empresas",
  utilidades: "Utilidades corporativas personalizadas",
};

export function getCategoryHeading(name: string) {
  return categoryCopy[normalizeCategoryName(name)] ?? `${name} para empresas`;
}
