import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Mestre do Estudo — Aprenda de verdade, no seu ritmo",
    template: "%s · Mestre do Estudo",
  },
  description:
    "Plataforma adaptativa de estudos para educação básica: Português, Matemática e Inglês com progressão por domínio, correção por IA gratuita, tutor, simulados e relatórios para o responsável.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers defaultTheme="system">
          <a href="#conteudo" className="skip-link">
            Pular para o conteúdo
          </a>
          <Nav />
          <main id="conteudo">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
