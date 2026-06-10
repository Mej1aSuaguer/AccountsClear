// src/app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { Sidebar } from './_components/Sidebar';
import { Header } from './_components/Header';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}