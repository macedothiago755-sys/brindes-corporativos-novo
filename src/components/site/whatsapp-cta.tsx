"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Caminho de conversão paralelo ao formulário: abre o WhatsApp comercial com uma
 * mensagem já contextualizada (produto, kit, etc.). Captura o lead de alta intenção
 * que não quer preencher formulário, registrando o clique no funil (whatsapp_click).
 */
export function WhatsappCta({
  message,
  source,
  productName,
  label = "Tirar dúvida no WhatsApp",
  className,
}: {
  message: string;
  source: string;
  productName?: string;
  label?: string;
  className?: string;
}) {
  function open() {
    trackEvent("whatsapp_click", { source, ...(productName ? { product_name: productName } : {}) });
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-success px-5 py-2.5 text-sm font-medium text-success transition-colors hover:bg-success hover:text-success-foreground",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </button>
  );
}
