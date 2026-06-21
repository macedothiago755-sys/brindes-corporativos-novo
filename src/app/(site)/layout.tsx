import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { NewsletterPopup } from "@/components/site/newsletter-popup";
import { CookieConsent } from "@/components/site/cookie-consent";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-accent"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="flex-1">{children}</main>
      <Footer />
      <WhatsappButton />
      <NewsletterPopup />
      <CookieConsent />
    </>
  );
}
