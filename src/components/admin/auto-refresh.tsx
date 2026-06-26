"use client";

import { useEffect } from "react";

export function AutoRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  useEffect(() => {
    const timer = setInterval(() => {
      window.location.reload();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return null;
}
