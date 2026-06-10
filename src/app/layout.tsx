// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/firebase/provider';
import { AuthProvider } from '@/firebase/auth-provider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AccountsClear - Gestión para Bares y Discotecas',
  description: 'SaaS en tiempo real para operación nocturna en Colombia',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased bg-zinc-950 text-zinc-100`}>
        <FirebaseProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}