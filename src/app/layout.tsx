// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/firebase/provider';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="es" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.variable} antialiased bg-zinc-950 text-zinc-100`}>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
