import Link from "next/link";
import Image from "next/image";
import {
  CONTACT_EMAIL,
  WHATSAPP_NUMBER,
  WHATSAPP_MESSAGE,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  BUSINESS_HOURS_DISPLAY,
  BUSINESS_ADDRESS,
} from "@/lib/site-config";

export function Footer() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <footer id="contato" className="border-t border-border bg-muted">
      <div className="container-premium grid gap-10 py-16 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/logo-paint-colors.png" alt="Paint Colors Company" width={32} height={32} className="h-8 w-8" />
            <p className="text-lg font-semibold tracking-tight">Paint Colors</p>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Brindes corporativos personalizados para empresas que querem criar experiências memoráveis.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Catálogo</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/categoria/escritorio">Escritório</Link></li>
            <li><Link href="/categoria/informatica">Informática</Link></li>
            <li><Link href="/categoria/kit-churrasco">Kit Churrasco</Link></li>
            <li><Link href="/categoria/canecas">Canecas</Link></li>
            <li><Link href="/categoria/linha-ecologica">Linha Ecológica</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Empresa</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/sobre">Sobre a empresa</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/#como-funciona">Como funciona</Link></li>
            <li><Link href="/admin/login">Acesso administrativo</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Contato comercial</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a href={`tel:${BUSINESS_PHONE_E164}`} className="hover:text-foreground">
                {BUSINESS_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Fale pelo WhatsApp
              </a>
            </li>
            <li>
              <address className="not-italic">
                {BUSINESS_ADDRESS.street}
                <br />
                {BUSINESS_ADDRESS.locality} – {BUSINESS_ADDRESS.region}, CEP {BUSINESS_ADDRESS.postalCode}
              </address>
            </li>
            <li>{BUSINESS_HOURS_DISPLAY}</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Privacidade e Segurança</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/politica-de-privacidade">Aviso de Privacidade</Link></li>
            <li><Link href="/termos-de-uso">Termos de Uso</Link></li>
            <li><Link href="/politica-de-cookies">Política de Cookies</Link></li>
          </ul>
        </div>
      </div>

      <div className="container-premium flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Paint Colors. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
