# 💰 AccountsClear - SaaS para Bares y Discotecas

![AccountsClear](https://via.placeholder.com/800x200/1a1a2e/00ff9f?text=ACCOUNTSCLEAR)

**Plataforma en tiempo real para la gestión operativa de bares y discotecas en Colombia.**

---

## ✨ Descripción del Proyecto

**AccountsClear** es un SaaS multi-tenant diseñado específicamente para el sector nocturno colombiano. Permite a dueños de bares y discotecas gestionar mesas por zonas, recibir **comandas en tiempo real** desde celulares de meseros, visualizar pedidos instantáneamente en barra y cocina, manejar pre-cuentas con propina legal del 10% y, especialmente, soportar el **Turno Flotante Nocturno**.

El sistema elimina el papeleo, reduce errores en cuentas, acelera la rotación de mesas y proporciona control total de la operación nocturna.

---

## 🚀 Características Principales (Fase 1)

### 💼 Gestión del Negocio
- Registro y configuración de múltiples bares (multi-tenant)
- Creación de zonas (VIP, Terraza, Barra, General, etc.)
- Configuración ilimitada de mesas por zona

### 📱 Operación en Tiempo Real
- Comandas instantáneas desde móvil/tablet de meseros
- Sincronización en milisegundos con `onSnapshot` (Firestore)
- Pantalla de despacho para Barra y Cocina (pedidos pendientes)
- Actualización automática del estado de las mesas (Libre / Ocupada)

### 💵 Caja y Facturación
- Pre-cuenta en tiempo real por mesa
- Cálculo automático de propina legal del **10%**
- Total en pesos colombianos ($ COP)
- Soporte para Turno Flotante Nocturno

### 🌙 Motor de Turno Flotante Nocturno
- Configuración personalizada de horario de turno (ej: Sábado 18:00 → Domingo 05:00)
- Cierre de ventas por turno en lugar de día calendario
- Reportes diarios por turno con totales y métricas

### 🔐 Seguridad y Roles
- Roles: `owner`, `cashier`, `waiter`, `bartender`
- Cada usuario vinculado a un `barId`
- Autenticación segura con Firebase Auth

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router + Server Components)
- **UI**: React 19 + TypeScript 5 (tipado estricto)
- **Estilos**: Tailwind CSS 3.4+ + shadcn/ui
- **Backend**: Firebase v10+ (Firestore + Auth)
- **Tiempo Real**: Firestore `onSnapshot`
- **Tema**: Soporte completo para **Tema Oscuro** (ideal para ambiente nocturno)

---

## 📁 Estructura del Proyecto

```bash
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── _components/
│   │   ├── bars/
│   │   ├── tables/
│   │   ├── orders/
│   │   ├── kitchen/
│   │   ├── pos/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── common/
│   ├── tables/
│   ├── orders/
│   └── kitchen/
├── firebase/
│   ├── config.ts
│   ├── provider.tsx
│   ├── client-provider.tsx
│   ├── auth-provider.tsx
│   ├── index.ts
│   └── firestore/
│       ├── useCollection.tsx
│       └── useDoc.tsx
├── lib/
│   ├── types.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── validations.ts
├── hooks/
└── stores/