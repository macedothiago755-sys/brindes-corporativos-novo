import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RH IA — Painel",
  description: "Gestão de vagas e triagem assistida por IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
