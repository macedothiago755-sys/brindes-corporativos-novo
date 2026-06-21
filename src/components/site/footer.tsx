import Link from "next/link";
import Image from "next/image";
import { CONTACT_EMAIL, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@/lib/site-config";

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
            <li><Link href="/produtos?categoria=escritorio">Escritório</Link></li>
            <li><Link href="/produtos?categoria=tecnologia">Tecnologia</Link></li>
            <li><Link href="/produtos?categoria=kit-churrasco">Kit Churrasco</Link></li>
            <li><Link href="/produtos?categoria=canecas">Canecas</Link></li>
            <li><Link href="/produtos?categoria=sustentaveis">Sustentáveis</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Empresa</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/#diferenciais">Diferenciais</Link></li>
            <li><Link href="/#como-funciona">Como funciona</Link></li>
            <li><Link href="/admin/login">Acesso administrativo</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Contato comercial</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>{CONTACT_EMAIL}</li>
            <li>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Fale pelo WhatsApp
              </a>
            </li>
            <li>Atendimento para empresas em São Paulo e em todo o Brasil</li>
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
