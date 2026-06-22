declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export type AnalyticsEvent =
  | "view_product"
  | "view_category"
  | "start_quote"
  | "complete_quote"
  | "whatsapp_click"
  | "category_click"
  | "start_kit"
  | "generate_kit"
  | "newsletter_view"
  | "generate_lead";

export function trackEvent(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  // GA4 (gtag.js) lê eventos disparados via gtag('event', ...).
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
  // Mantém o push no dataLayer como fallback compatível com Google Tag Manager.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
