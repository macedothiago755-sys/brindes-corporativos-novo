import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import {
  SITE_URL,
  SITE_NAME,
  CONTACT_EMAIL,
  GTM_CONTAINER_ID,
  BUSINESS_PHONE_E164,
  BUSINESS_ADDRESS,
} from "@/lib/site-config";
import "./globals.css";

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: BUSINESS_ADDRESS.street,
  addressLocality: BUSINESS_ADDRESS.locality,
  addressRegion: BUSINESS_ADDRESS.region,
  postalCode: BUSINESS_ADDRESS.postalCode,
  addressCountry: BUSINESS_ADDRESS.country,
};

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
    // Imagem padrão de compartilhamento (links sem OG próprio: home, sobre,
    // blog, categorias). Sem ela, prévias no WhatsApp/LinkedIn vinham sem
    // imagem, derrubando o CTR. Produto e post sobrescrevem com a própria.
    images: [{ url: "/banners/banner-home-1-marca.jpg", width: 1717, height: 916, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brindes Corporativos Personalizados em São Paulo | Paint Colors",
    description:
      "Crie kits e brindes corporativos personalizados em São Paulo. Personalize sua marca, escolha produtos e receba uma proposta rápida.",
    images: ["/banners/banner-home-1-marca.jpg"],
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
  telephone: BUSINESS_PHONE_E164,
  address: postalAddress,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Vendas",
    email: CONTACT_EMAIL,
    telephone: BUSINESS_PHONE_E164,
    areaServed: "BR",
    availableLanguage: "Portuguese",
  },
  sameAs: [
    "https://www.instagram.com/paintcolors_personalizados/",
    "https://www.linkedin.com/company/paint-colors-brasil/",
  ],
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
  logo: `${SITE_URL}/logo-paint-colors.png`,
  image: `${SITE_URL}/logo-paint-colors.png`,
  email: CONTACT_EMAIL,
  telephone: BUSINESS_PHONE_E164,
  address: postalAddress,
  areaServed: {
    "@type": "City",
    name: "São Paulo, SP",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
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
        {GTM_CONTAINER_ID && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {GTM_CONTAINER_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
