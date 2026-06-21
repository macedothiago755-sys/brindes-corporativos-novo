import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Brindes Corporativos Personalizados em São Paulo | Paint Colors",
    template: "%s | Paint Colors",
  },
  description:
    "Crie kits e brindes corporativos personalizados em São Paulo. Personalize sua marca, escolha produtos e receba uma proposta rápida.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Especialistas em brindes corporativos personalizados para empresas: catálogo inteligente, orçamento sob medida e atendimento dedicado.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Vendas",
    email: CONTACT_EMAIL,
    areaServed: "BR",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description: "Fornecedor de brindes corporativos personalizados para empresas em São Paulo.",
  url: SITE_URL,
  areaServed: {
    "@type": "City",
    name: "São Paulo, SP",
  },
  // telefone / endereço / horário: adicionar quando a empresa informar (sem endereço físico publicável por ora).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
