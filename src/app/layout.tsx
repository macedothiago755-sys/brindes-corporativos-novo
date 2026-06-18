import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "Brindes Corporativos | Brindes personalizados para empresas",
    template: "%s | Brindes Corporativos",
  },
  description:
    "Produtos corporativos personalizados para empresas que querem criar experiências memoráveis. Solicite um orçamento sob medida.",
  metadataBase: new URL("https://www.brindescorporativos.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Brindes Corporativos",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Brindes Corporativos",
  url: "https://www.brindescorporativos.com.br",
  description:
    "Especialistas em brindes corporativos personalizados para empresas: catálogo inteligente, orçamento sob medida e atendimento dedicado.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Vendas",
    email: "comercial@brindescorporativos.com",
    areaServed: "BR",
  },
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
          dangerouslySetInnerHTML={{ __html: "window.dataLayer = window.dataLayer || [];" }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
