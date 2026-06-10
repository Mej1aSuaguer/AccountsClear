// src/app/dashboard/_components/Sidebar.tsx
'use client';

import { Package } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Table, 
  ChefHat, 
  Receipt, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/dashboard/tables', icon: Table, label: 'Mesas' },
  { href: '/dashboard/orders', icon: Receipt, label: 'Comandas' },
  { href: '/dashboard/kitchen', icon: ChefHat, label: 'Barra / Cocina' },
  { href: '/dashboard/pos', icon: Users, label: 'Caja' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Reportes' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
  { href: '/dashboard/products', icon: Package, label: 'Menú / Productos' },
  
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-screen flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-emerald-500">AccountsClear</h1>
        <p className="text-xs text-zinc-500 mt-1">Operación Nocturna</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-zinc-800 text-emerald-500"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
          
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 mt-auto">
        {/* Espacio para logout o info del bar */}
      </div>
    </div>
  );
}