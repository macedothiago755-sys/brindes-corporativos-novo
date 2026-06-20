import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="contato" className="border-t border-border bg-muted">
      <div className="container-premium grid gap-10 py-16 lg:grid-cols-4">
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
            <li>comercial@brindescorporativos.com</li>
            <li>(11) 4000-0000</li>
            <li>Atendimento em todo o Brasil</li>
          </ul>
        </div>
      </div>

      <div className="container-premium flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Brindes Corporativos. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <Link href="/politica-de-privacidade" className="hover:text-foreground">Aviso de Privacidade</Link>
          <Link href="/termos-de-uso" className="hover:text-foreground">Termos de Uso</Link>
        </div>
      </div>
    </footer>
  );
}
