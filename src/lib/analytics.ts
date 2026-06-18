declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsEvent =
  | "view_product"
  | "start_quote"
  | "complete_quote"
  | "whatsapp_click"
  | "category_click";

export function trackEvent(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
