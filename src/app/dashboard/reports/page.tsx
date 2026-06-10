// src/app/dashboard/reports/page.tsx
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
import { Order, Turno } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Clock, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [currentTurno, setCurrentTurno] = useState<Turno | null>(null);
  const [loading, setLoading] = useState(true);

  // Escucha de órdenes del bar
  useEffect(() => {
    if (!userData?.barId) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('barId', '==', userData.barId)
    );

    const turnosQuery = query(
      collection(db, 'turnos'),
      where('barId', '==', userData.barId)
    );

    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(data);
    });

    const unsubTurnos = onSnapshot(turnosQuery, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Turno[];
      // Ordenar turnos más recientes primero
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      const openTurno = data.find(t => t.status === 'open');
      setCurrentTurno(openTurno || null);
      setTurnos(data);
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubTurnos();
    };
  }, [userData?.barId]);

  // Calcular métricas del turno actual
  const currentOrders = orders.filter(o => o.turnoDate === currentTurno?.fechaInicio.toISOString().split('T')[0] || true);
  
  const totalVentas = currentOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPropinas = currentOrders.reduce((sum, o) => sum + o.propina, 0);
  const ordersCount = currentOrders.length;

  const openNewTurno = async () => {
    if (!userData?.barId) return;

    const now = new Date();
    const turnoDate = now.toISOString().split('T')[0];

    await addDoc(collection(db, 'turnos'), {
      barId: userData.barId,
      fechaInicio: serverTimestamp(),
      fechaFin: null,
      totalVentas: 0,
      totalPropinas: 0,
      ordersCount: 0,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    alert('Nuevo Turno Nocturno iniciado correctamente.');
  };

  const closeCurrentTurno = async () => {
    if (!currentTurno) return;
    if (!confirm('¿Estás seguro de cerrar el turno actual? Esta acción es irreversible.')) return;

    await addDoc(collection(db, 'turnos'), { // En producción se actualizaría el documento existente
      ...currentTurno,
      fechaFin: serverTimestamp(),
      totalVentas: totalVentas,
      totalPropinas: totalPropinas,
      ordersCount: ordersCount,
      status: 'closed',
      closedBy: userData?.uid,
      updatedAt: serverTimestamp()
    });

    alert('Turno cerrado exitosamente. Reporte guardado.');
  };

  if (loading) return <p>Cargando reportes...</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            Reportes y Turnos
          </h1>
          <p className="text-zinc-400">Gestión de Turno Flotante Nocturno</p>
        </div>
      </div>

      {/* Turno Actual */}
      <Card className="bg-zinc-900 border-emerald-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Turno Actual</span>
            {currentTurno ? (
              <Badge className="bg-emerald-500/20 text-emerald-400">ABIERTO</Badge>
            ) : (
              <Badge variant="destructive">SIN TURNO ACTIVO</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTurno ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-950 p-6 rounded-xl text-center">
                <p className="text-zinc-400 text-sm">VENTAS TOTALES</p>
                <p className="text-4xl font-bold text-emerald-400 mt-2">
                  ${totalVentas.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-xl text-center">
                <p className="text-zinc-400 text-sm">PROPINAS (10%)</p>
                <p className="text-4xl font-bold text-emerald-400 mt-2">
                  ${totalPropinas.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-xl text-center">
                <p className="text-zinc-400 text-sm">COMANDAS</p>
                <p className="text-4xl font-bold text-white mt-2">{ordersCount}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <p className="text-xl text-zinc-400">No hay turno abierto</p>
              <Button onClick={openNewTurno} className="mt-6">Iniciar Nuevo Turno</Button>
            </div>
          )}

          {currentTurno && (
            <Button 
              onClick={closeCurrentTurno}
              variant="destructive"
              className="w-full mt-8"
            >
              Cerrar Turno Actual
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Historial de Turnos */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Historial de Turnos Cerrados</CardTitle>
        </CardHeader>
        <CardContent>
          {turnos.filter(t => t.status === 'closed').length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Aún no hay turnos cerrados.</p>
          ) : (
            <div className="space-y-4">
              {turnos.filter(t => t.status === 'closed').map((turno) => (
                <div key={turno.id} className="flex justify-between items-center bg-zinc-950 p-5 rounded-xl">
                  <div>
                    <p className="font-medium">Turno del {turno.fechaInicio.toLocaleDateString('es-CO')}</p>
                    <p className="text-sm text-zinc-500">Cerrado por {turno.closedBy}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">
                      ${turno.totalVentas?.toLocaleString('es-CO') || '0'}
                    </p>
                    <p className="text-xs text-zinc-500">{turno.ordersCount} comandas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}