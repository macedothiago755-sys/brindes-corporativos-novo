export const SITE_URL = "https://www.paintcolorscompany.com";
export const SITE_NAME = "Paint Colors";
export const CONTACT_EMAIL = "comercial@paintcolorscompany.com";

// WhatsApp comercial (formato internacional: 55 + DDD + número).
export const WHATSAPP_NUMBER = "5511959309442";
export const WHATSAPP_MESSAGE = "Olá, gostaria de receber ajuda para escolher brindes corporativos.";

// NAP (Nome, Endereço, Telefone) — manter IDÊNTICO em todo o site e no Google
// Business Profile. Consistência de NAP é fator de ranqueamento de SEO Local.
export const BUSINESS_PHONE_DISPLAY = "+55 11 95930-9442";
export const BUSINESS_PHONE_E164 = "+5511959309442";
export const BUSINESS_HOURS_DISPLAY = "Segunda a sexta, das 8h às 18h";
export const BUSINESS_ADDRESS = {
  street: "Av. Brigadeiro Faria Lima, 1811 — Sala 1119",
  locality: "São Paulo",
  region: "SP",
  postalCode: "01452-001",
  country: "BR",
} as const;

// Google Analytics 4 (configurado dentro do contêiner do GTM, não carregado direto aqui).
export const GA_MEASUREMENT_ID = "G-4GH20JYB0G";

// Google Tag Manager — gerencia GA4 e demais tags (pixels, conversões etc).
export const GTM_CONTAINER_ID = "GTM-KZJX54HT";
