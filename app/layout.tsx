import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lidom Podcast Show',
  description: 'Sitio oficial de los Lidom Podcast Show de la Liga de Béisbol Profesional de la República Dominicana',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/favicon.ico" />
        {/* Script de Umami Analytics */}
        <Script
          strategy="lazyOnload"
          src="https://cloud.umami.is/script.js"
          data-website-id="6dc48438-aadc-4152-8587-5d3293c92011"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}