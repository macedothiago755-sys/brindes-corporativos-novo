"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/produtos", label: "Catálogo" },
  { href: "/blog", label: "Blog" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-premium flex h-20 items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          BRINDES<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild>
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
            <Button asChild size="lg" className="mt-2">
              <Link href="/produtos">Solicitar orçamento</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
