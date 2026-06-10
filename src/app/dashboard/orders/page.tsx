// src/app/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, OrderItem, ProductCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, CheckCircle, Clock } from 'lucide-react';

export default function OrdersPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Escucha en tiempo real de comandas del bar
  useEffect(() => {
    if (!userData?.barId) return;

    const q = query(
      collection(db, 'orders'),
      where('barId', '==', userData.barId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Ordenar por más recientes primero
      ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.barId]);

  const createTestOrder = async () => {
    if (!userData?.barId) return;

    const tableId = prompt("ID de la mesa (ej: mesa-1):") || "mesa-1";

    const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      barId: userData.barId,
      tableId,
      waiterId: userData.uid,
      status: 'pending',
      items: [
        {
          productId: "cerveza-1",
          name: "Cerveza Pola",
          quantity: 2,
          price: 8000,
          category: "cervezas" as ProductCategory
        },
        {
          productId: "shot-1",
          name: "Shot de Tequila",
          quantity: 1,
          price: 15000,
          category: "shots" as ProductCategory
        }
      ],
      subtotal: 31000,
      propina: Math.round(31000 * 0.10),
      total: Math.round(31000 * 1.10),
      turnoDate: new Date().toISOString().split('T')[0],
      notes: "Mesa VIP - Sin hielo en el shot",
    };

    await addDoc(collection(db, 'orders'), {
      ...newOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500',
      preparing: 'bg-blue-500/20 text-blue-400 border-blue-500',
      ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
      delivered: 'bg-purple-500/20 text-purple-400 border-purple-500',
      closed: 'bg-zinc-600 text-zinc-400',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500', // <-- Agregamos esto
    };

    const labels = {
      pending: 'Pendiente',
      preparing: 'En Preparación',
      ready: 'Listo',
      delivered: 'Entregado',
      closed: 'Cerrado',
      cancelled: 'Cancelado', // <-- Agregamos esto
    };

    return (
      <Badge className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };
  
  if (loading) return <p>Cargando comandas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comandas en Tiempo Real</h1>
          <p className="text-zinc-400">Total: {orders.length} comandas activas</p>
        </div>
        <Button onClick={createTestOrder} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          Crear Comanda de Prueba
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Mesa #{order.tableId}</CardTitle>
                  <p className="text-sm text-zinc-500">Mesero: {order.waiterId}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-medium">${item.price.toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Propina (10%)</span>
                <span className="text-emerald-400">+${order.propina.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-zinc-800">
                <span>Total</span>
                <span>${order.total.toLocaleString('es-CO')}</span>
              </div>

              {order.notes && (
                <p className="text-xs text-amber-400 italic">Nota: {order.notes}</p>
              )}

              <div className="flex gap-2 pt-4">
                {order.status === 'pending' && (
                  <Button 
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    En Preparación
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

      {orders.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800 p-16 text-center">
          <p className="text-zinc-400 text-lg">No hay comandas activas en este momento.</p>
          <Button onClick={createTestOrder} className="mt-6">Crear primera comanda</Button>
        </Card>
      )}
    </div>
  );
}