import { WHATSAPP_NUMBER } from "@/lib/site-config";

/**
 * Monta o link wa.me com uma mensagem contextual já preenchida. Usar mensagens
 * com o produto/kit em questão aumenta a taxa de resposta do time comercial e
 * dá ao lead um caminho de baixa fricção quando ele não quer preencher formulário.
 */
export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
