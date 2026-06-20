import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { NewsletterPopup } from "@/components/site/newsletter-popup";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappButton />
      <NewsletterPopup />
    </>
  );
}
