import Link from "next/link";

export function Footer() {
  return (
    <footer id="contato" className="border-t border-border bg-muted">
      <div className="container-premium grid gap-10 py-16 lg:grid-cols-4">
        <div>
          <p className="text-xl font-semibold tracking-tight">
            BRINDES<span className="text-accent">.</span>
          </p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Brindes corporativos personalizados para empresas que querem criar experiências memoráveis.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Catálogo</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/produtos?categoria=escritorio">Escritório</Link></li>
            <li><Link href="/produtos?categoria=tecnologia">Tecnologia</Link></li>
            <li><Link href="/produtos?categoria=kits-corporativos">Kits Corporativos</Link></li>
            <li><Link href="/produtos?categoria=sustentaveis">Sustentáveis</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Empresa</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
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

      <div className="container-premium border-t border-border py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Brindes Corporativos. Todos os direitos reservados.
      </div>
    </footer>
  );
}
