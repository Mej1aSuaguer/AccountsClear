// src/app/dashboard/tables/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Table as TableType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default function TablesPage() {
  const { userData } = useAuth();
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);

  // Escucha en tiempo real de las mesas del bar
  useEffect(() => {
    if (!userData?.barId) return;

    const q = query(
      collection(db, 'tables'),
      where('barId', '==', userData.barId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tablesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TableType[];
      
      setTables(tablesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.barId]);

  const addTable = async () => {
    if (!userData?.barId) return;

    const zone = prompt("Zona de la mesa (VIP, Terraza, Barra, etc.):") || "General";
    const number = parseInt(prompt("Número de mesa:") || "1");

    await addDoc(collection(db, 'tables'), {
      barId: userData.barId,
      zone,
      number,
      status: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'occupied': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reserved': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-zinc-700 text-zinc-400';
    }
  };

  if (loading) return <p>Cargando mesas...</p>;

  // Agrupar por zona
  const tablesByZone = tables.reduce((acc, table) => {
    if (!acc[table.zone]) acc[table.zone] = [];
    acc[table.zone].push(table);
    return acc;
  }, {} as Record<string, TableType[]>);

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

      {Object.keys(tablesByZone).map((zone) => (
        <Card key={zone} className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Zona: {zone}
              <Badge variant="outline">{tablesByZone[zone].length} mesas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tablesByZone[zone].map((table) => (
                <div
                  key={table.id}
                  className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-105 ${getStatusColor(table.status)}`}
                >
                  <div className="text-4xl font-bold mb-2">#{table.number}</div>
                  <Badge 
                    variant="outline" 
                    className="capitalize"
                  >
                    {table.status === 'free' ? 'Libre' : 'Ocupada'}
                  </Badge>
                  {table.occupiedBy && (
                    <p className="text-xs text-zinc-500 mt-2">Ocupada por mesero</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {tables.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Aún no hay mesas configuradas.</p>
          <Button onClick={addTable} className="mt-4">Crear primera mesa</Button>
        </Card>
      )}
    </div>
  );
}