"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_NUMBER = "5511400000000";
const DEFAULT_MESSAGE = "Olá, gostaria de receber ajuda para escolher brindes corporativos.";

export function WhatsappButton() {
  const [open, setOpen] = useState(false);

  function openWhatsapp() {
    trackEvent("whatsapp_click", { source: "floating_button" });
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 animate-fade-in-up rounded-2xl border border-border bg-background p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Precisa de ajuda?</p>
                <p className="text-xs text-muted-foreground">Fale com um especialista</p>
              </div>
            </div>
            <button
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-foreground/80">
            Nossa equipe comercial pode te ajudar a escolher o brinde ideal e enviar uma proposta personalizada.
          </p>
          <button
            onClick={openWhatsapp}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-medium text-success-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Iniciar conversa no WhatsApp
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat do WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
