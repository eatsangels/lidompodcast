import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lidom Podcast Show',
  description: 'Sitio oficial de los Lidom Podcast Show de la Liga de Béisbol Profesional de la República Dominicana',
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
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Envolvemos la aplicación en SessionProvider */}
          <SessionProvider>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
