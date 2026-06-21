"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/produtos", label: "Produtos" },
  { href: "/vitrine/mais-vendidos", label: "Soluções" },
  { href: "/blog", label: "Inspirações" },
  { href: "/#diferenciais", label: "Sobre nós" },
  { href: "/#contato", label: "Contato" },
];

const drawerGroups = [
  {
    title: "Produtos",
    items: [
      { href: "/produtos?categoria=escritorio", label: "Escritório" },
      { href: "/produtos?categoria=informatica", label: "Informática" },
      { href: "/produtos?categoria=linha-ecologica", label: "Linha ecológica" },
      { href: "/produtos?categoria=canecas", label: "Canecas" },
      { href: "/produtos", label: "Ver todas categorias" },
    ],
  },
  {
    title: "Soluções",
    items: [
      { href: "/produtos?objetivo=EVENTO", label: "Eventos corporativos" },
      { href: "/montar-kit", label: "RH" },
      { href: "/produtos?objetivo=CLIENTE_VIP", label: "Clientes" },
      { href: "/produtos?objetivo=ONBOARDING", label: "Onboarding" },
    ],
  },
  {
    title: "Empresa",
    items: [
      { href: "/#diferenciais", label: "Sobre" },
      { href: "/#como-funciona", label: "Como funciona" },
      { href: "/#cases", label: "Cases" },
    ],
  },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-premium flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-paint-colors.png"
            alt="Paint Colors Company"
            width={52}
            height={52}
            className="h-[52px] w-[52px]"
            priority
          />
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">Paint Colors</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="outline-accent">
            <Link href="/montar-kit">Montar meu kit</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/produtos">Solicitar orçamento</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild size="sm" variant="gradient">
            <Link href="/montar-kit">Montar meu kit</Link>
          </Button>
          <button className="p-1" onClick={() => setOpen(!open)} aria-label="Abrir menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-border lg:hidden">
          <nav className="container-premium flex flex-col gap-6 py-6">
            {drawerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.title}</p>
                <div className="mt-3 flex flex-col gap-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-base font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Button asChild size="lg" variant="gradient">
              <Link href="/produtos" onClick={() => setOpen(false)}>Solicitar orçamento</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
