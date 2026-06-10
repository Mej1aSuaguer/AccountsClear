// src/app/dashboard/tables/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

// Tipado local rápido alineado con los datos de Firestore
interface TableType {
  id: string;
  number: string | number;
  zone: string;
  status: 'free' | 'occupied';
}

export default function TablesPage() {
  const { userData } = useAuth();
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);

  // Escuchar las mesas asignadas al bar en tiempo real
  useEffect(() => {
    if (!userData?.barId) return;

    const q = query(
      collection(db, 'tables'),
      where('barId', '==', userData.barId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TableType[];
      
      // Ordenar numéricamente por el número de mesa
      data.sort((a, b) => Number(a.number) - Number(b.number));
      setTables(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.barId]);

  // Agregar una nueva mesa rápida por defecto a la zona general
  const addTable = async () => {
    if (!userData?.barId) return;
    
    const nextNumber = tables.length + 1;
    await addDoc(collection(db, 'tables'), {
      barId: userData.barId,
      number: nextNumber,
      zone: 'General',
      status: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  // Manejo de colores de estado según diseño Tailwind
  const getStatusColor = (status: TableType['status']) => {
    if (status === 'free') {
      return 'border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/40 text-white';
    }
    return 'border-amber-500 bg-amber-950/20 text-amber-400';
  };

  // Redirección o aviso según estado
  const openOrderForTable = (table: TableType) => {
    if (table.status === 'occupied') {
      alert(`Mesa #${table.number} ya está ocupada. Ve a Comandas.`);
      return;
    }
    // Redirigir a comandas pasándole el parámetro por la URL
    window.location.href = `/dashboard/orders?table=${table.number}`;
  };

  // Agrupar las mesas por zonas de manera dinámica
  const tablesByZone = tables.reduce((acc, table) => {
    const zone = table.zone || 'General';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, TableType[]>);

  if (loading) return <p className="p-6 text-zinc-400">Cargando mapa de mesas...</p>;

  // Retorno JSX encapsulado correctamente dentro del componente
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Mesas</h1>
          <p className="text-zinc-400">Tiempo real • {tables.length} mesas</p>
        </div>
        <Button onClick={addTable} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          Nueva Mesa
        </Button>
      </div>

      {Object.keys(tablesByZone).length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-16 text-center">
          <p className="text-zinc-400">No hay mesas registradas en este bar.</p>
          <Button onClick={addTable} className="mt-4">Crear Mesa #1</Button>
        </Card>
      ) : (
        Object.keys(tablesByZone).map((zone) => (
          <Card key={zone} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-300">
                Zona: {zone} ({tablesByZone[zone].length} mesas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tablesByZone[zone].map((table) => (
                  <div
                    key={table.id}
                    onClick={() => openOrderForTable(table)}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-6 cursor-pointer transition-all hover:scale-105 ${getStatusColor(table.status)}`}
                  >
                    <div className="text-5xl font-bold mb-3">#{table.number}</div>
                    <Badge className="capitalize text-sm">
                      {table.status === 'free' ? 'Libre' : 'Ocupada'}
                    </Badge>
                    {table.status === 'occupied' && (
                      <p className="text-xs text-zinc-500 mt-3 text-center">Toca para ver comanda</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}