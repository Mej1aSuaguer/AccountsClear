// src/firebase/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './provider';

const publicRoutes = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!currentUser && !isPublicRoute) {
      router.push('/login');
    } 
    
    if (currentUser && isPublicRoute) {
      router.push('/dashboard');
    }
  }, [currentUser, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}