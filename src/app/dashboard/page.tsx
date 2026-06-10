// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bienvenido a AccountsClear</h1>
      <p className="text-zinc-400">Selecciona una sección del menú lateral para comenzar.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold">Mesas Activas</h3>
          <p className="text-4xl font-bold text-emerald-500 mt-4">0</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold">Comandas Pendientes</h3>
          <p className="text-4xl font-bold text-amber-500 mt-4">0</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold">Ventas del Turno</h3>
          <p className="text-4xl font-bold text-white mt-4">$0</p>
        </div>
      </div>
    </div>
  );
}