// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Bar, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { userData, currentUser } = useAuth();
  const [bar, setBar] = useState<Bar | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [barName, setBarName] = useState('');
  const [turnoInicio, setTurnoInicio] = useState('18:00');
  const [turnoFin, setTurnoFin] = useState('05:00');

  // Cargar bar y usuarios
  useEffect(() => {
    if (!userData?.barId && userData?.role === 'owner') {
      setLoading(false);
      return;
    }

    if (userData?.barId) {
      // Cargar información del bar
      const barRef = doc(db, 'bars', userData.barId);
      // ... (podemos agregar onSnapshot aquí después)

      // Cargar usuarios del bar
      const q = query(
        collection(db, 'users'),
        where('barId', '==', userData.barId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ uid: d.id, ...d.data() })) as User[];
        setUsers(data);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  const createBar = async () => {
    if (!currentUser) return;

    const newBar: Omit<Bar, 'id' | 'createdAt' | 'updatedAt'> = {
      ownerId: currentUser.uid,
      name: barName || 'Mi Bar',
      settings: {
        propinaLegal: 10,
        turnoInicio,
        turnoFin,
        zonas: ['Barra', 'General', 'VIP', 'Terraza']
      }
    };

    const barRef = await addDoc(collection(db, 'bars'), {
      ...newBar,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Actualizar usuario owner con el barId
    await setDoc(doc(db, 'users', currentUser.uid), {
      barId: barRef.id,
      role: 'owner'
    }, { merge: true });

    alert('¡Bar creado exitosamente!');
  };

  const addUser = async () => {
    const email = prompt("Email del nuevo usuario:");
    const name = prompt("Nombre completo:");
    const role = prompt("Rol (waiter, bartender, cashier):") as any;

    if (!email || !name || !userData?.barId) return;

    await addDoc(collection(db, 'users'), {
      uid: "pending-" + Date.now(), // En producción se crearía con Firebase Auth
      barId: userData.barId,
      email,
      name,
      role,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    alert('Usuario invitado (en producción se enviaría email de invitación)');
  };

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-emerald-500" />
        <h1 className="text-3xl font-bold">Configuración del Bar</h1>
      </div>

      {!userData?.barId ? (
        <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <CardHeader>
            <CardTitle>Crear tu Bar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Nombre del Bar / Discoteca</Label>
              <Input 
                value={barName} 
                onChange={(e) => setBarName(e.target.value)}
                placeholder="La Pola Loca"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Inicio de Turno</Label>
                <Input 
                  type="time" 
                  value={turnoInicio} 
                  onChange={(e) => setTurnoInicio(e.target.value)} 
                />
              </div>
              <div>
                <Label>Fin de Turno</Label>
                <Input 
                  type="time" 
                  value={turnoFin} 
                  onChange={(e) => setTurnoFin(e.target.value)} 
                />
              </div>
            </div>

            <Button onClick={createBar} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
              Crear Bar y Configurar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-zinc-900 border-emerald-900/50">
            <CardHeader>
              <CardTitle>{userData.name} • {bar?.name || 'Mi Bar'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Turno configurado:</strong> {bar?.settings.turnoInicio} - {bar?.settings.turnoFin}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuarios del Bar
              </CardTitle>
              <Button onClick={addUser}>+ Agregar Usuario</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.uid} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}