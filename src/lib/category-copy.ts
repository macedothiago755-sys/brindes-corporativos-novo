import { normalizeCategoryName } from "@/components/site/category-icons";

const categoryCopy: Record<string, string> = {
  brinquedos: "Brinquedos personalizados para empresas",
  canecas: "Canecas personalizadas para empresas",
  canetas: "Canetas personalizadas para empresas",
  "casa e decoracao": "Casa e decoração personalizados para empresas",
  copos: "Copos personalizados para empresas",
  escritorio: "Brindes de escritório personalizados para empresas",
  espelhos: "Espelhos personalizados para empresas",
  esporte: "Brindes esportivos personalizados para empresas",
  eventos: "Brindes para eventos corporativos",
  "kit churrasco": "Kits de churrasco personalizados para empresas",
  "kits corporativos": "Kits corporativos personalizados",
  "linha pet": "Brindes pet personalizados para empresas",
  "moda e estilo": "Moda e estilo personalizados para empresas",
  petisqueiras: "Petisqueiras personalizadas para empresas",
  plaquinhas: "Plaquinhas personalizadas para empresas",
  premium: "Brindes premium para empresas",
  "sacolas e sacochilas": "Ecobags e sacolas personalizadas para empresas",
  sustentaveis: "Brindes sustentáveis para empresas",
  tecnologia: "Brindes de tecnologia personalizados para empresas",
  tabuas: "Tábuas personalizadas para empresas",
  utilidades: "Utilidades corporativas personalizadas",
};

export function getCategoryHeading(name: string) {
  return categoryCopy[normalizeCategoryName(name)] ?? `${name} para empresas`;
}
