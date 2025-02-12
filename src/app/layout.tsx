'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang="fr">
      <body className={inter.className}>
        <NextAuthProvider>
          {isAdminPage ? (
            children
          ) : (
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          )}
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
} 