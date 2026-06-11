// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Table, Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table as TableIcon, Clock, TrendingUp, Users } from 'lucide-react';
import { Table as Plus, ChefHat } from 'lucide-react';

export default function DashboardHome() {
  const { userData } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.barId) return;

    const tablesQ = query(
      collection(db, 'tables'),
      where('barId', '==', userData.barId)
    );

    const ordersQ = query(
      collection(db, 'orders'),
      where('barId', '==', userData.barId)
    );

    const unsubTables = onSnapshot(tablesQ, (snap) => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() } as Table)));
    });

    const unsubOrders = onSnapshot(ordersQ, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
    });

    setLoading(false);

    return () => {
      unsubTables();
      unsubOrders();
    };
  }, [userData?.barId]);

  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const pendingOrders = orders.filter(o => ['pending', 'preparing'].includes(o.status)).length;
  const totalSalesToday = orders
    .filter(o => o.status === 'closed')
    .reduce((sum, o) => sum + o.total, 0);

  if (loading) return <p>Cargando dashboard...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Bienvenido a AccountsClear</h1>
        <p className="text-zinc-400 text-lg">Operación en tiempo real • Turno activo</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mesas Ocupadas</CardTitle>
            <TableIcon className="w-8 h-8 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-white">{occupiedTables}</div>
            <p className="text-zinc-500">de {tables.length} mesas totales</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Comandas Activas</CardTitle>
            <Clock className="w-8 h-8 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-amber-400">{pendingOrders}</div>
            <p className="text-zinc-500">pendientes de atención</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ventas del Turno</CardTitle>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-emerald-400">
              ${totalSalesToday.toLocaleString('es-CO')}
            </div>
            <p className="text-zinc-500">acumulado hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Meseros Activos</CardTitle>
            <Users className="w-8 h-8 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">4</div>
            <Badge className="mt-2">En turno</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 hover:border-emerald-600 cursor-pointer transition-colors"
              onClick={() => window.location.href = '/dashboard/tables'}>
          <CardContent className="p-8 text-center">
            <TableIcon className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
            <h3 className="text-xl font-semibold">Ver Mesas</h3>
            <p className="text-zinc-500">Gestionar ocupación</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-600 cursor-pointer transition-colors"
              onClick={() => window.location.href = '/dashboard/orders'}>
          <CardContent className="p-8 text-center">
            <Plus className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-semibold">Nueva Comanda</h3>
            <p className="text-zinc-500">Atender clientes</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-600 cursor-pointer transition-colors"
              onClick={() => window.location.href = '/dashboard/kitchen'}>
          <CardContent className="p-8 text-center">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-semibold">Ir a Cocina</h3>
            <p className="text-zinc-500">Despachar pedidos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}