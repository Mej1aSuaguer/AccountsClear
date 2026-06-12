// src/app/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase/provider';

import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, OrderItem, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar productos y comandas en tiempo real
  useEffect(() => {
    if (!userData?.barId) return;

    const productsQuery = query(
      collection(db, 'products'),
      where('barId', '==', userData.barId),
      where('isActive', '==', true)
    );

    const ordersQuery = query(
      collection(db, 'orders'),
      where('barId', '==', userData.barId)
    );

    const unsubProducts = onSnapshot(productsQuery, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
    });

    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setOrders(data);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [userData?.barId]);

  // EFECTO 1: Cargar productos y comandas en tiempo real (Este ya lo tienes)
  useEffect(() => {
    if (!userData?.barId) return;
    const productsQuery = query(
      collection(db, 'products'),
      where('barId', '==', userData.barId),
      where('isActive', '==', true)
    );
    const ordersQuery = query(
      collection(db, 'orders'),
      where('barId', '==', userData.barId)
    );
    const unsubProducts = onSnapshot(productsQuery, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
    });
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setOrders(data);
      setLoading(false);
    });
    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [userData?.barId]);

  // EFECTO 2: ¡PEGA ESTE NUEVO BLOQUE AQUÍ ABAJO!
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableFromUrl = params.get('table');
    if (tableFromUrl) {
      setSelectedTableId(tableFromUrl);
    }
  }, []);

  const addItemToOrder = (product: Product) => {
    const existing = selectedItems.findIndex(item => item.productId === product.id);
    
    if (existing !== -1) {
      const updated = [...selectedItems];
      updated[existing].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        category: product.category
      }]);
    }
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const createOrder = async () => {
    if (!userData?.barId || !selectedTableId || selectedItems.length === 0) {
      alert("Selecciona una mesa y al menos un producto");
      
      return;
      
    }

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const propina = Math.round(subtotal * 0.10);
    const total = subtotal + propina;

    const newOrder = {
      barId: userData.barId,
      tableId: selectedTableId,
      waiterId: userData.uid,
      status: 'pending' as const,
      items: selectedItems,
      subtotal,
      propina,
      total,
      turnoDate: new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'orders'), newOrder);
    await markTableAsOccupied(selectedTableId);

    // Limpiar formulario
    setSelectedItems([]);
    setSelectedTableId('');
    setNotes('');
    alert('¡Comanda enviada correctamente a Barra/Cocina!');
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  };

  

  // ... (mantener las funciones getStatusBadge y renderizado de comandas existentes)

  const markTableAsOccupied = async (tableNumber: string) => {
  // Buscar la mesa por número
  const tablesQ = query(
    collection(db, 'tables'),
    where('barId', '==', userData!.barId),
    where('number', '==', Number(tableNumber))
  );

  const snapshot = await getDocs(tablesQ); // Necesitas importar getDocs
  if (!snapshot.empty) {
    const tableDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'tables', tableDoc.id), {
      status: 'occupied',
      occupiedSince: serverTimestamp(),
      occupiedBy: userData!.uid,
      currentOrderId: 'active', // placeholder
      updatedAt: serverTimestamp()
    });
  }
};

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Crear Comanda</h1>
      </div>

      {/* Formulario para nueva comanda */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Nueva Comanda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Número de Mesa</label>
            <Input
              placeholder="Ej: 7, VIP-3, Barra-1"
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Productos del Menú</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-auto p-1">
              {products.map(product => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start hover:bg-zinc-800"
                  onClick={() => addItemToOrder(product)}
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-emerald-400 text-sm">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Items seleccionados */}
          {selectedItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Productos en esta comanda:</h3>
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg">
                    <div>
                      <span>{item.quantity} × {item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Notas adicionales</Label>
            <Input
              placeholder="Sin hielo, con limón, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button onClick={createOrder} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">
            Enviar Comanda a Barra / Cocina
          </Button>
        </CardContent>
      </Card>

      {/* Lista de comandas existentes (mantener la parte anterior) */}
      {/* ... (puedes copiar la sección de visualización de órdenes del código anterior) */}
    </div>
  );
}