// src/app/dashboard/kitchen/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, ChefHat } from 'lucide-react';

export default function KitchenPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Solo mostrar comandas pendientes o en preparación
  useEffect(() => {
    if (!userData?.barId) return;

    const q = query(
      collection(db, 'orders'),
      where('barId', '==', userData.barId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Filtrar solo las que necesitan atención en cocina/barra
      const activeOrders = allOrders
        .filter(order => ['pending', 'preparing'].includes(order.status))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Más antiguas primero

      setOrders(activeOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.barId]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    if (status === 'pending') {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500">Pendiente</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">En Preparación</Badge>;
  };

  if (loading) return <p>Cargando pantalla de despacho...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Barra / Cocina</h1>
            <p className="text-zinc-400">Despacho en tiempo real • {orders.length} pendientes</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-20 text-center">
          <ChefHat className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
          <p className="text-xl text-zinc-400">No hay comandas pendientes</p>
          <p className="text-zinc-500 mt-2">Las nuevas aparecerán aquí automáticamente</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="bg-zinc-900 border-l-4 border-l-orange-500 hover:border-orange-600 transition-all"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl">Mesa #{order.tableId}</CardTitle>
                    <p className="text-sm text-zinc-500">Comanda #{order.id.slice(0,8)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-auto pr-2 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between bg-zinc-950 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{item.quantity} × {item.name}</span>
                      </div>
                      <span className="text-emerald-400 font-medium">
                        ${item.price.toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="text-amber-400 text-sm italic bg-amber-950/50 p-3 rounded border border-amber-900">
                    Nota: {order.notes}
                  </div>
                )}

                <Separator className="bg-zinc-800" />

                <div className="flex gap-3 pt-2">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Empezar Preparación
                    </Button>
                  )}

                  {order.status === 'preparing' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Listo para Entregar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}