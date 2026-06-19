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

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-premium flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-paint-colors.png" alt="Paint Colors Company" width={40} height={40} className="h-10 w-10" priority />
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">Paint Colors</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="gradient">
            <Link href="/produtos">Solicitar orçamento</Link>
          </Button>
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border lg:hidden">
          <nav className="container-premium flex flex-col gap-4 py-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-base font-medium" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Button asChild size="lg" variant="gradient" className="mt-2">
              <Link href="/produtos">Solicitar orçamento</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
