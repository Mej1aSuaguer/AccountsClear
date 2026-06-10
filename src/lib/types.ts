// src/lib/types.ts
export type UserRole = 'owner' | 'cashier' | 'waiter' | 'bartender';

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'closed' | 'cancelled';

export type ProductCategory = 'cervezas' | 'licores' | 'shots' | 'botellas' | 'comidas' | 'combos' | 'otros';

export type TurnoStatus = 'open' | 'closed';

/** Usuario del sistema */
export interface User {
  uid: string;
  barId: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  pin?: string;                    // PIN para login rápido en tablets
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Información de un Bar / Discoteca */
export interface Bar {
  id: string;
  ownerId: string;
  name: string;
  address?: string;
  phone?: string;
  nit?: string;
  logoUrl?: string;
  settings: {
    propinaLegal: number;          // 10 por defecto
    turnoInicio: string;           // Ej: "18:00"
    turnoFin: string;              // Ej: "05:00"
    zonas: string[];               // ["VIP", "Terraza", "Barra", "General"]
  };
  createdAt: Date;
  updatedAt: Date;
}

/** Mesa individual */
export interface Table {
  id: string;
  barId: string;
  zone: string;
  number: number;
  status: TableStatus;
  currentOrderId?: string | null;
  occupiedSince?: Date;
  occupiedBy?: string;             // userId del mesero
  createdAt: Date;
  updatedAt: Date;
}

/** Ítem dentro de una comanda */
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  category: ProductCategory;
  notes?: string;
}

/** Comanda / Pedido */
export interface Order {
  id: string;
  barId: string;
  tableId: string;
  waiterId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  propina: number;
  total: number;
  notes?: string;
  turnoDate: string;               // YYYY-MM-DD del turno nocturno
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: string;
}

/** Producto del menú */
export interface Product {
  id: string;
  barId: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Cierre de Turno Flotante Nocturno */
export interface Turno {
  id: string;
  barId: string;
  fechaInicio: Date;
  fechaFin?: Date;
  totalVentas: number;
  totalPropinas: number;
  ordersCount: number;
  status: TurnoStatus;
  closedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos auxiliares
export type FirestoreTimestamp = any; // Será reemplazado por Timestamp de Firebase