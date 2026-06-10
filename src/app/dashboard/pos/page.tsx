// src/app/dashboard/pos/page.tsx
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
import { Receipt, CheckCircle } from 'lucide-react';

export default function PosPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Mostrar solo comandas listas o entregadas pendientes de cerrar
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

      const posOrders = allOrders
        .filter(order => ['ready', 'delivered'].includes(order.status))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setOrders(posOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.barId]);

  const closeOrder = async (orderId: string) => {
    if (!confirm('¿Deseas cerrar esta cuenta y marcar la mesa como libre?')) return;

    await updateDoc(doc(db, 'orders', orderId), {
      status: 'closed',
      closedAt: serverTimestamp(),
      closedBy: userData?.uid,
      updatedAt: serverTimestamp()
    });

    // Aquí en el futuro se actualizaría también el estado de la mesa a 'free'
    alert('¡Cuenta cerrada exitosamente! Propina registrada.');
  };

  if (loading) return <p>Cargando punto de venta...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-500" />
            Punto de Venta / Caja
          </h1>
          <p className="text-zinc-400">Pre-cuentas listas para cerrar • Propina legal 10%</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-20 text-center">
          <Receipt className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
          <p className="text-xl text-zinc-400">No hay cuentas listas para cerrar</p>
          <p className="text-zinc-500 mt-2">Las comandas entregadas aparecerán aquí</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-zinc-900 border-emerald-900/50 hover:border-emerald-700 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Mesa #{order.tableId}</CardTitle>
                    <p className="text-sm text-zinc-500">Comanda #{order.id.slice(0,8)}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500">Lista para Cobrar</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-zinc-300">
                        {item.quantity} × {item.name}
                      </span>
                      <span>${item.price.toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-zinc-800" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Propina legal (10%)</span>
                    <span>+ ${order.propina.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-zinc-700">
                    <span>Total a Pagar</span>
                    <span className="text-emerald-400">${order.total.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                {order.notes && (
                  <p className="text-xs italic text-amber-400 bg-amber-950/30 p-3 rounded">
                    {order.notes}
                  </p>
                )}

                <Button 
                  onClick={() => closeOrder(order.id)}
                  className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 mt-4"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Cerrar Cuenta y Liberar Mesa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}