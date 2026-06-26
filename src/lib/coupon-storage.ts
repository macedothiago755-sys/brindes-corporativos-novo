export const COUPON_STORAGE_KEY = "brindes:coupon-code";

export function getStoredCoupon() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(COUPON_STORAGE_KEY) ?? "";
}

export function setStoredCoupon(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUPON_STORAGE_KEY, code);
}
