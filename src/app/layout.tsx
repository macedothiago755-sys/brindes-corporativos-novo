import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SITE_URL, SITE_NAME, CONTACT_EMAIL, WHATSAPP_NUMBER, GA_MEASUREMENT_ID } from "@/lib/site-config";
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
  twitter: {
    card: "summary_large_image",
    title: "Brindes Corporativos Personalizados em São Paulo | Paint Colors",
    description:
      "Crie kits e brindes corporativos personalizados em São Paulo. Personalize sua marca, escolha produtos e receba uma proposta rápida.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-paint-colors.png`,
  description:
    "Especialistas em brindes corporativos personalizados para empresas: catálogo inteligente, orçamento sob medida e atendimento dedicado.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Vendas",
    email: CONTACT_EMAIL,
    telephone: `+${WHATSAPP_NUMBER}`,
    areaServed: "BR",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "pt-BR",
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description: "Fornecedor de brindes corporativos personalizados para empresas em São Paulo.",
  url: SITE_URL,
  telephone: `+${WHATSAPP_NUMBER}`,
  areaServed: {
    "@type": "City",
    name: "São Paulo, SP",
  },
  // endereço / horário: adicionar quando a empresa informar (sem endereço físico publicável por ora).
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
