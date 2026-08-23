# PLAN_DESARROLLO.md — Adornos Rematico Villavicencio

## 0. Resumen Ejecutivo

Plataforma web empresarial para **Adornos Rematico Villavicencio** que combina sitio público + dashboard administrativo inteligente con IA, automatización y paneles en tiempo real. El sistema está diseñado para ser modular, escalable y preparado para crecer durante años.

**Stack principal:**
- Frontend: Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
- Backend: Node.js (servicio independiente)
- Base de datos: PostgreSQL
- ORM: Prisma
- Cache/Eventos: Redis
- Tiempo real: Socket.IO
- Despliegue: Docker + Nginx + HTTPS
- Auth: JWT + Refresh Tokens

---

## 1. Arquitectura General

### 1.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                  │
│                  (Navegador / Móvil)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │    Nginx     │
                    │  (Reverse    │
                    │   Proxy +    │
                    │   SSL/TLS)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │  Next.js   │ │  Node.js   │ │  Socket.IO │
     │  (Frontend)│ │  (API)     │ │  (WS)      │
     │  :3000     │ │  :4000     │ │  :4001     │
     └────────────┘ └─────┬──────┘ └────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ PostgreSQL │ │   Redis    │ │  Prisma    │
     │   :5432    │ │   :6379    │ │  (ORM)     │
     └────────────┘ └────────────┘ └────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌──────────────────────────────────────────┐
     │        Event Bus (Redis Pub/Sub)         │
     │  PaymentReceived | SaleCompleted | ...   │
     └──────────────────────────────────────────┘
```

### 1.2 Principios Arquitectónicos

- **Separación de responsabilidades**: Frontend, Backend y Base de datos son servicios independientes.
- **Arquitectura basada en eventos**: Todos los módulos se comunican mediante eventos a través de Redis Pub/Sub.
- **Clean Architecture**: Cada módulo tiene su propia capa de dominio, aplicación e infraestructura.
- **Repository Pattern**: Acceso a datos abstracto detrás de interfaces.
- **Service Layer**: Lógica de negocio centralizada en servicios reutilizables.
- **DTO Pattern**: Contratos de datos explícitos entre capas.
- **Dependency Inversion**: Módulos dependen de abstracciones, no de implementaciones concretas.

### 1.3 Estructura de Monorepo

```
rematicos/
├── apps/
│   ├── web/                    # Next.js 15 (Frontend + Admin)
│   │   ├── app/                # App Router (Next.js 15)
│   │   │   ├── (public)/       # Página pública
│   │   │   │   ├── page.tsx
│   │   │   │   ├── about/
│   │   │   │   ├── catalog/
│   │   │   │   ├── gallery/
│   │   │   │   ├── contact/
│   │   │   │   ├── faq/
│   │   │   │   └── location/
│   │   │   ├── (admin)/        # Dashboard administrativo
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── payments/
│   │   │   │   ├── products/
│   │   │   │   ├── customers/
│   │   │   │   ├── sales/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   ├── components/         # Componentes UI (shadcn/ui)
│   │   ├── lib/                # Utilidades, config, helpers
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API clients
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── middleware.ts       # Next.js middleware (auth)
│   │   └── next.config.js
│   │
│   └── api/                    # Node.js Backend (servicio independiente)
│       ├── src/
│       │   ├── index.ts        # Entry point
│       │   ├── server.ts       # Express/Fastify + Socket.IO
│       │   ├── routes/
│       │   │   ├── auth/
│       │   │   ├── payments/
│       │   │   ├── products/
│       │   │   ├── customers/
│       │   │   ├── sales/
│       │   │   ├── dashboard/
│       │   │   ├── settings/
│       │   │   ├── audit/
│       │   │   └── webhooks/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── types/
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   ├── shared/                 # Tipos compartidos, constantes, utils
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── database/               # Prisma schema + migraciones
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── migrations/
│   │
│   ├── events/                 # Event Bus (Redis Pub/Sub)
│   │   ├── publisher.ts
│   │   ├── subscriber.ts
│   │   ├── event-types.ts
│   │   └── handlers/
│   │
│   ├── ai/                     # Módulos de IA (futuros)
│   │   ├── whatsapp/
│   │   ├── ocr/
│   │   ├── recommendations/
│   │   ├── analytics/
│   │   └── assistant/
│   │
│   ├── auth/                   # Módulo de autenticación
│   │   ├── jwt.ts
│   │   ├── middleware.ts
│   │   └── strategies/
│   │
│   ├── payments/               # Módulo de pagos (BRE-B)
│   │   ├── services/
│   │   ├── providers/          # Abstracción de proveedores TTS
│   │   ├── webhooks/
│   │   └── types.ts
│   │
│   ├── notifications/          # TTS, Email, Push
│   │   ├── tts/
│   │   │   ├── provider.ts     # Interface abstracta
│   │   │   ├── openai.ts
│   │   │   ├── google.ts
│   │   │   ├── azure.ts
│   │   │   └── index.ts
│   │   ├── email/
│   │   └── push/
│   │
│   ├── automations/            # Motor de automatizaciones
│   │   ├── engine.ts
│   │   ├── rules/
│   │   └── triggers/
│   │
│   ├── admin/                  # Componentes del panel admin
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   └── ui/                     # Componentes shadcn/ui compartidos
│       ├── components/
│       ├── hooks/
│       └── lib/
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.nginx
│   │   └── .dockerignore
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── conf.d/
│   │   │   ├── web.conf
│   │   │   └── api.conf
│   │   └── ssl/
│   └── ci-cd/
│       ├── Dockerfile
│       └── deploy.sh
│
├── docs/
│   ├── PLAN_DESARROLLO.md
│   ├── CHANGELOG.md
│   ├── ARCHITECTURA.md
│   └── BRE-B_ANALYSIS.md
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .env.local.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.base.json
├── package.json
└── README.md
```

---

## 2. Entidades y Relaciones (Prisma Schema)

### 2.1 Schema Prisma

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH ────────────────────────────────────────────

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @relation(fields: [roleId], references: [id])
  roleId        String
  avatar        String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]
  payments      Payment[]
  sales         Sale[]
  notifications Notification[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model Role {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  permissions Json      @default("[]")
  users       User[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("roles")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

// ─── CATALOGO ────────────────────────────────────────

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("categories")
}

model Product {
  id          String    @id @default(uuid())
  name        String
  description String?
  price       Decimal   @db.Decimal(10, 2)
  stock       Int       @default(0)
  imageUrl    String?
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryId  String?
  isActive    Boolean   @default(true)
  sales       Sale[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("products")
}

// ─── CLIENTES ────────────────────────────────────────

model Customer {
  id         String   @id @default(uuid())
  name       String
  email      String?
  phone      String?
  document   String?
  address    String?
  notes      String?
  sales      Sale[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("customers")
}

// ─── PAGOS (BRE-B) ───────────────────────────────────

model Payment {
  id               String   @id @default(uuid())
  reference        String   @unique
  bank             String?
  buyerName        String
  buyerDocument    String?
  value            Decimal   @db.Decimal(12, 2)
  currency         String   @default("COP")
  dateTime         DateTime
  status           PaymentStatus @default(PENDING)
  receiptNumber    String?
  channel          String?
  metadata         Json     @default("{}")
  userId           String?
  user             User?    @relation(fields: [userId], references: [id])
  sale             Sale?    @relation(fields: [saleId], references: [id])
  saleId           String?
  auditLogs        AuditLog[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("payments")
}

enum PaymentStatus {
  PENDING
  VALIDATED
  CONFIRMED
  FAILED
  REJECTED
  REFUNDED
}

// ─── VENTAS ──────────────────────────────────────────

model Sale {
  id          String   @id @default(uuid())
  paymentId   String?  @unique
  payment     Payment? @relation(fields: [paymentId], references: [id])
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(12, 2)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  auditLogs   AuditLog[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("sales")
}

// ─── AUDITORÍA ───────────────────────────────────────

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String
  entity    String
  entityId  String?
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@map("audit_logs")
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

// ─── NOTIFICACIONES ──────────────────────────────────

model Notification {
  id        String   @id @default(uuid())
  type      String
  title     String
  message   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  read      Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now())

  @@map("notifications")
}

// ─── CONFIGURACIÓN ───────────────────────────────────

model Setting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  category  String
  updatedBy String?
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@map("settings")
}

// ─── CONFIGURACIÓN TTS ───────────────────────────────

model TTSConfig {
  id        String   @id @default(uuid())
  provider  String   @default("openai")
  voice     String
  speed     Float    @default(1.0)
  volume    Float    @default(1.0)
  language  String   @default("es-CO")
  settings  Json     @default("{}")
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@map("tts_configs")
}

// ─── AUTOMATIZACIONES ────────────────────────────────

model AutomationRule {
  id        String   @id @default(uuid())
  name      String
  event     String
  condition Json?
  action    Json
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("automation_rules")
}
```

### 2.2 Relaciones Clave

```
User ────┬─── Payment (creó/registrar)
         ├─── Sale (vendió)
         ├─── AuditLog (acciones)
         ├─── Notification (recibidas)
         └─── RefreshToken

Role ──── User (asignación)

Category ──── Product (categorización)

Product ──── Sale (producto vendido)

Customer ──── Sale (cliente de la venta)

Payment ──── Sale (pago asociado a venta)
Payment ──── AuditLog (auditoría del pago)

Sale ──── AuditLog (auditoría de la venta)

Setting ──── Configuración global
TTSConfig ── Configuración de voz
AutomationRule ── Reglas de automatización
```

---

## 3. Eventos del Sistema

### 3.1 Catálogo de Eventos

| Evento | Descripción | Módulos que lo emiten | Módulos que lo escuchan |
|--------|-------------|----------------------|------------------------|
| `Payment.Received` | Nuevo pago detectado | payments | notifications, automations, dashboard, tts |
| `Payment.Validated` | Pago validado exitosamente | payments | notifications, dashboard, automations |
| `Payment.Failed` | Pago rechazado/fallido | payments | notifications, dashboard |
| `Payment.Confirmed` | Pago confirmado por banco | payments | sales, notifications, dashboard |
| `Sale.Completed` | Venta registrada | sales | dashboard, notifications, automations, inventory |
| `Product.Created` | Nuevo producto creado | products | dashboard, notifications |
| `Product.Updated` | Producto actualizado | products | dashboard |
| `Product.LowStock` | Stock bajo detectado | products | notifications, automations |
| `Customer.Registered` | Nuevo cliente registrado | customers | dashboard, notifications, automations |
| `User.LoggedIn` | Usuario inició sesión | auth | audit, notifications |
| `User.Created` | Nuevo usuario creado | auth | audit, notifications |
| `User.Updated` | Usuario actualizado | auth | audit |
| `Notification.Sent` | Notificación enviada | notifications | audit |
| `Automation.Triggered` | Regla de automatización ejecutada | automations | audit |
| `Settings.Updated` | Configuración modificada | settings | audit, notifications |

### 3.2 Interfaz de Eventos

```typescript
// packages/events/event-types.ts

interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

interface PaymentReceivedEvent extends BaseEvent {
  type: "Payment.Received";
  data: {
    paymentId: string;
    reference: string;
    bank: string | null;
    buyerName: string;
    buyerDocument: string | null;
    value: number;
    currency: string;
    dateTime: Date;
    channel: string | null;
    receiptNumber: string | null;
    metadata: Record<string, unknown>;
  };
}

interface PaymentValidatedEvent extends BaseEvent {
  type: "Payment.Validated";
  data: {
    paymentId: string;
    reference: string;
    status: "VALIDATED" | "CONFIRMED" | "FAILED" | "REJECTED";
    validatedBy: string;
    notes?: string;
  };
}

interface SaleCompletedEvent extends BaseEvent {
  type: "Sale.Completed";
  data: {
    saleId: string;
    paymentId: string;
    customerId: string;
    customerName: string;
    productId: string;
    productName: string;
    quantity: number;
    total: number;
    userId: string;
  };
}

interface ProductLowStockEvent extends BaseEvent {
  type: "Product.LowStock";
  data: {
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  };
}

type SystemEvent = PaymentReceivedEvent | PaymentValidatedEvent | SaleCompletedEvent | ProductLowStockEvent;
```

---

## 4. Módulos y Responsabilidades

### 4.1 Módulo Auth

**Responsabilidades:**
- Registro de usuarios
- Login / logout
- Generación de JWT y refresh tokens
- Middleware de autenticación
- Gestión de roles y permisos
- Rate limiting en login
- Protección contra fuerza bruta

**Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

**Archivos:**
```
apps/api/src/routes/auth/
├── index.ts
├── register.ts
├── login.ts
├── refresh.ts
├── logout.ts
├── me.ts
├── middleware.ts
└── validators.ts
```

### 4.2 Módulo Payments (BRE-B)

**Responsabilidades:**
- Consulta de pagos BRE-B
- Verificación automática de pagos
- Almacenamiento de registros de pagos
- Validación de referencias
- Webhook receivers (cuando estén disponibles)
- Estado de pagos

**Endpoints:**
- `GET /api/payments` (listar con filtros)
- `GET /api/payments/:id` (detalle)
- `POST /api/payments/verify` (verificar pago manual)
- `GET /api/payments/export` (exportar PDF/Excel/CSV)
- `POST /api/payments/webhook` (webhook de banco)

**Archivos:**
```
apps/api/src/routes/payments/
├── index.ts
├── list.ts
├── detail.ts
├── verify.ts
├── webhook.ts
├── export.ts
├── validators.ts
└── services/
    ├── payment-service.ts
    ├── breb-provider.ts
    └── payment-validator.ts
```

### 4.3 Módulo Products

**Responsabilidades:**
- CRUD de productos
- Gestión de categorías
- Control de inventario
- Alertas de stock bajo

**Endpoints:**
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/categories`

### 4.4 Módulo Customers

**Responsabilidades:**
- CRUD de clientes
- Historial de compras
- Búsqueda y filtros

**Endpoints:**
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `GET /api/customers/:id/sales`

### 4.5 Módulo Sales

**Responsabilidades:**
- Registro de ventas
- Asociación con pagos
- Cálculo de totales
- Generación de facturas

**Endpoints:**
- `GET /api/sales`
- `POST /api/sales`
- `GET /api/sales/:id`
- `GET /api/sales/export`

### 4.6 Módulo Dashboard

**Responsabilidades:**
- Estadísticas en tiempo real
- Gráficos de ventas e ingresos
- Resumen de pagos pendientes
- Actividad reciente

**Endpoints:**
- `GET /api/dashboard/stats`
- `GET /api/dashboard/sales-chart`
- `GET /api/dashboard/payments-chart`
- `GET /api/dashboard/recent-activity`

### 4.7 Módulo Notifications (TTS)

**Responsabilidades:**
- Capa de abstracción TTS
- Proveedores: OpenAI, Google Cloud TTS, Azure Speech
- Configuración de voz, velocidad, volumen, idioma
- Reproducción de notificaciones de pago

**Archivos:**
```
packages/notifications/tts/
├── provider.ts          # Interface abstracta
├── openai.ts            # Proveedor OpenAI
├── google.ts            # Proveedor Google Cloud TTS
├── azure.ts             # Proveedor Azure Speech
├── factory.ts           # Factory para crear proveedor
└── index.ts             # Exportaciones
```

### 4.8 Módulo Automations

**Responsabilidades:**
- Motor de reglas basado en eventos
- Configuración de automatizaciones
- Ejecución de acciones cuando se disparan eventos
- Historial de ejecuciones

**Endpoints:**
- `GET /api/automations`
- `POST /api/automations`
- `PUT /api/automations/:id`
- `DELETE /api/automations/:id`
- `POST /api/automations/:id/toggle`
- `GET /api/automations/:id/logs`

### 4.9 Módulo Settings

**Responsabilidades:**
- Configuración de empresa
- Configuración de TTS
- Configuración de integraciones
- Configuración de seguridad
- Configuración de backups

**Endpoints:**
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/settings/:key`
- `PUT /api/settings/:key`

### 4.10 Módulo Audit

**Responsabilidades:**
- Registro de todas las acciones del sistema
- Consulta de logs de auditoría
- Exportación de logs
- Cumplimiento normativo

**Endpoints:**
- `GET /api/audit/logs`
- `GET /api/audit/logs/:id`
- `GET /api/audit/export`

---

## 5. Análisis BRE-B (Colombia)

### 5.1 ¿Qué es BRE-B?

**Nota:** La integración específica con BRE-B requiere investigación adicional y autorización de los bancos y/o la red de pagos correspondiente. A continuación se documenta lo conocido y la arquitectura preparada para la integración.

### 5.2 Estado de la Investigación

| Aspecto | Estado | Notas |
|---------|--------|-------|
| API oficial BRE-B | ❌ No confirmado | Requiere contacto con la entidad emisora |
| Webhooks oficiales | ❌ No confirmado | Preparada la infraestructura para recibirlos |
| Integración Open Finance | ❌ No confirmado | Arquitectura preparada |
| Bancos compatibles | ❓ Por determinar | Lista configurable en settings |
| Métodos de consulta | ❓ Por determinar | Se implementará polling como fallback |
| Restricciones | ❓ Por determinar | Documentación pendiente |

### 5.3 Arquitectura Preparada para BRE-B

El módulo de pagos está diseñado con una arquitectura de proveedores (provider pattern) que permite conectar cualquier fuente de pagos sin modificar el resto del sistema:

```
apps/api/src/routes/payments/services/
├── payment-service.ts      # Servicio principal (independiente del proveedor)
├── breb-provider.ts        # Proveedor BRE-B (se completará cuando haya API)
├── mock-provider.ts        # Proveedor mock para desarrollo/testing
└── payment-validator.ts    # Validación de datos de pagos
```

### 5.4 Interfaz del Proveedor de Pagos

```typescript
// apps/api/src/routes/payments/services/provider.interface.ts

interface PaymentProvider {
  name: string;
  initialize(config: Record<string, unknown>): Promise<void>;
  checkPayment(reference: string): Promise<PaymentVerificationResult>;
  listPayments(filters: PaymentFilters): Promise<Payment[]>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
  getSupportedBanks(): Promise<string[]>;
}

interface PaymentVerificationResult {
  id: string;
  reference: string;
  bank: string | null;
  buyerName: string;
  buyerDocument: string | null;
  value: number;
  currency: string;
  dateTime: Date;
  status: "PENDING" | "VALIDATED" | "CONFIRMED" | "FAILED" | "REJECTED";
  receiptNumber: string | null;
  channel: string | null;
  metadata: Record<string, unknown>;
}
```

### 5.5 Flujo de Verificación de Pagos

```
┌─────────────────────────────────────────────────────────┐
│                    Flujo de Pagos BRE-B                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Cliente realiza pago en el banco                    │
│                          │                              │
│                          ▼                              │
│  2. Banco procesa el pago                                │
│                          │                              │
│                          ▼                              │
│  3a. [Si hay webhook] → POST /api/payments/webhook     │
│                          │                              │
│  3b. [Si no hay webhook] → Sistema hace polling        │
│      cada X minutos consultando la API del banco       │
│                          │                              │
│                          ▼                              │
│  4. Sistema recibe datos del pago                       │
│                          │                              │
│                          ▼                              │
│  5. PaymentService.processPayment(data)                 │
│     ├── Validar datos                                   │
│     ├── Guardar en PostgreSQL                           │
│     ├── Emitir evento Payment.Received                  │
│     ├── Notificar vía TTS                               │
│     ├── Actualizar dashboard en tiempo real             │
│     └── Registrar en AuditLog                           │
│                          │                              │
│                          ▼                              │
│  6. Eventos disparan automatizaciones                   │
│     ├── Notificación al negocio (TTS + visual)         │
│     ├── Actualización de estadísticas                  │
│     └── Registro de auditoría                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Diseño UI/UX

### 6.1 Paleta de Colores

```css
/* Modo claro (default) */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--primary-foreground: 0 0% 98%;
--accent: 240 4.8% 95.9%;
--accent-foreground: 240 5.9% 10%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--border: 240 5.9% 90%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;

/* Modo oscuro */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 0 0% 98%;
--primary-foreground: 240 5.9% 10%;
--accent: 240 3.7% 15.9%;
--accent-foreground: 0 0% 98%;
--muted: 240 3.7% 15.9%;
--muted-foreground: 240 5% 64.9%;
--border: 240 3.7% 15.9%;
--card: 240 10% 3.9%;
--card-foreground: 0 0% 98%;
```

### 6.2 Tipografía

- **Display**: Inter (headings)
- **Body**: Inter (body text)
- **Mono**: JetBrains Mono (código, datos)

### 6.3 Espaciado y Layout

- Basado en sistema de 8px
- Container máximo: 1280px
- Sidebar colapsable (admin)
- Header fijo con búsqueda global

### 6.4 Animaciones

- Transiciones suaves: 200ms ease
- Micro-interacciones en hover
- Animaciones de entrada para tarjetas (stagger)
- Toast notifications con slide-in
- Paginación con skeleton loaders

---

## 7. Fases de Desarrollo

### Fase 0: Setup del Proyecto (1-2 días)

**Objetivo:** Tener el monorepo funcional con toda la infraestructura base.

**Tareas:**
1. Inicializar monorepo con npm workspaces
2. Configurar TypeScript base
3. Configurar ESLint + Prettier
4. Configurar Husky + lint-staged
5. Crear Dockerfiles para cada servicio
6. Crear docker-compose.yml con PostgreSQL + Redis
7. Configurar Nginx
8. Crear .env.example con todas las variables
9. Configurar Prisma con PostgreSQL
10. Primer commit

**Entregables:**
- Repositorio con estructura de carpetas
- Docker compose funcional
- TypeScript compilando sin errores
- Lint + Prettier configurados

---

### Fase 1: Backend Base + Auth (3-4 días)

**Objetivo:** Backend funcional con autenticación completa.

**Tareas:**
1. Setup del servidor Node.js (Express o Fastify)
2. Integración con Prisma Client
3. Implementar schema de base de datos (migración)
4. CRUD de Usuarios y Roles
5. Sistema de autenticación JWT + Refresh Tokens
6. Middleware de autenticación
7. Middleware de rate limiting
8. Middleware de seguridad (Helmet, CORS)
9. Sistema de auditoría básico
10. Event Bus básico (Redis Pub/Sub)
11. API docs (Swagger/OpenAPI)
12. Tests unitarios del auth module

**Entregables:**
- API funcional en :4000
- Login/register/logout funcionales
- JWT + refresh tokens
- Roles y permisos básicos
- Auditoría de acciones
- Docker compose con todos los servicios

---

### Fase 2: Frontend Base + Pública (4-5 días)

**Objetivo:** Sitio público funcional con diseño moderno.

**Tareas:**
1. Setup de Next.js 15 con App Router
2. Configuración de TailwindCSS + shadcn/ui
3. Diseño del layout global (header, footer, theme toggle)
4. Página de inicio
5. Página Nosotros
6. Página Catálogo (estática)
7. Página Ubicación (con mapa Google)
8. Página Contacto (formulario funcional)
9. Página FAQ
10. Página Galería
11. SEO completo (meta tags, sitemap, robots.txt, Open Graph)
12. Responsive design
13. Modo claro/oscuro
14. Animaciones suaves
15. Optimización de imágenes
16. Tests visuales básicos

**Entregables:**
- Sitio público en :3000
- Diseño moderno y responsive
- SEO técnico completo
- Formulario de contacto funcional

---

### Fase 3: Dashboard Administrativo (4-5 días)

**Objetivo:** Panel admin completo con login seguro.

**Tareas:**
1. Layout del dashboard admin (sidebar + header)
2. Página de login
3. Protección de rutas admin (middleware)
4. Dashboard principal con estadísticas
5. Tabla de pagos (con datos mock)
6. Tabla de productos (CRUD completo)
7. Tabla de clientes (CRUD completo)
8. Tabla de ventas
9. Tabla de usuarios y roles
10. Panel de configuración básica
11. Actividad reciente
12. Exportación de datos (CSV)
13. Filtros y búsqueda global
14. Responsive admin

**Entregables:**
- Dashboard admin funcional
- CRUD completo de entidades principales
- Sistema de roles y permisos funcional

---

### Fase 4: Módulo de Pagos BRE-B (5-7 días)

**Objetivo:** Verificación automática de pagos con almacenamiento completo.

**Tareas:**
1. Implementar schema de pagos en Prisma (migración)
2. Crear PaymentService con lógica de procesamiento
3. Implementar PaymentProvider interface (abstracta)
4. Crear MockProvider para desarrollo/testing
5. Crear BREBProvider (placeholder con documentación)
6. Endpoints CRUD de pagos
7. Endpoint de verificación manual
8. Endpoint de exportación (PDF, Excel, CSV)
9. Filtros: hoy, ayer, esta semana, este mes, rango de fechas
10. Búsqueda por nombre, monto, referencia, banco
11. Integración con Event Bus (emitir Payment.Received)
12. Integración con AuditLog
13. Tests unitarios del módulo de pagos

**Entregables:**
- Módulo de pagos funcional
- Mock provider para pruebas
- Endpoints de consulta y exportación
- Eventos de pagos funcionando

---

### Fase 5: Panel en Tiempo Real (3-4 días)

**Objetivo:** Dashboard en tiempo real con WebSocket.

**Tareas:**
1. Integrar Socket.IO en el backend
2. Crear canal WebSocket para pagos
3. Pantalla de panel en tiempo real (admin)
4. Tabla de últimos pagos con actualización automática
5. Pantalla POS para el negocio (pantalla grande)
6. Animación de tarjeta de nuevo pago
7. Desaparición suave de la tarjeta
8. Configuración de Socket.IO (autenticación, rooms)
9. Tests de WebSocket

**Entregables:**
- Panel en tiempo real funcionando
- Pantalla POS con animaciones
- Notificaciones en tiempo real sin recargar página

---

### Fase 6: Voz Automática (TTS) (3-4 días)

**Objetivo:** Notificación por voz cuando llega un pago.

**Tareas:**
1. Crear interfaz abstracta de TTS Provider
2. Implementar proveedor OpenAI TTS
3. Implementar proveedor Google Cloud TTS (placeholder)
4. Implementar proveedor Azure Speech (placeholder)
5. Factory para seleccionar proveedor
6. Endpoint de configuración de TTS
7. Panel de configuración de voz (voz, velocidad, volumen, idioma)
8. Integración con eventos (escuchar Payment.Received → TTS)
9. Pruebas de TTS
10. Tests unitarios del módulo TTS

**Entregables:**
- Sistema TTS funcional con OpenAI
- Interfaz de configuración de voz
- Arquitectura preparada para agregar más proveedores

---

### Fase 7: Automatizaciones (3-4 días)

**Objetivo:** Motor de automatizaciones basado en eventos.

**Tareas:**
1. Crear AutomationEngine
2. Definir formato de reglas de automatización
3. CRUD de reglas de automatización
4. Implementar triggers:
   - Pago recibido → anunciar
   - Pago recibido → guardar registro
   - Pago recibido → actualizar estadísticas
   - Pago recibido → enviar notificación
   - Pago recibido → registrar auditoría
   - Stock bajo → generar alerta
   - Sin ventas X días → notificar
5. Panel de configuración de automatizaciones
6. Historial de ejecuciones
7. Tests del motor de automatizaciones

**Entregables:**
- Motor de automatizaciones funcional
- 6 reglas predefinidas
- Panel de gestión de reglas

---

### Fase 8: IA y Módulos Futuros (5-7 días)

**Objetivo:** Preparar la carpeta /ai y los primeros módulos inteligentes.

**Tareas:**
1. Crear estructura /ai con módulos placeholder
2. Módulo de clasificación de clientes (placeholder)
3. Módulo de detección de pagos sospechosos (placeholder)
4. Módulo de análisis de ventas (placeholder)
5. Módulo de recomendaciones de productos (placeholder)
6. Módulo de generación de reportes automáticos (placeholder)
7. Módulo de asistente interno (placeholder)
8. Documentación de cada módulo con instrucciones de implementación futura
9. Tests de integración generales

**Entregables:**
- Carpeta /ai con estructura lista
- Módulos placeholder documentados
- Tests de integración

---

### Fase 9: Seguridad y Optimización (3-4 días)

**Objetivo:** Asegurar el sistema y optimizar rendimiento.

**Tareas:**
1. Implementar rate limiting global
2. Configurar Helmet en Express
3. Validación de datos con Zod en todas las rutas
4. Protección CSRF
5. Protección XSS (sanitización)
6. Protección SQL Injection (Prisma ya lo protege)
7. Logs de seguridad
8. Configurar backups automáticos de PostgreSQL
9. Optimización de queries de Prisma
10. Configurar índices en base de datos
11. Compresión de respuestas (gzip/brotli)
12. Caching con Redis (consultas frecuentes)
13. Tests de seguridad
14. Lighthouse audit

**Entregables:**
- Sistema seguro y optimizado
- Backups automáticos configurados
- Caching funcionando
- Lighthouse score > 90

---

### Fase 10: Despliegue y Producción (2-3 días)

**Objetivo:** Sistema desplegado y funcionando en producción.

**Tareas:**
1. Configurar Docker Compose para producción
2. Configurar Nginx con HTTPS (Let's Encrypt)
3. Configurar variables de entorno de producción
4. Configurar CI/CD pipeline
5. Configurar monitoreo básico
6. Configurar logs centralizados
7. Documentación de despliegue
8. Documentación de mantenimiento
9. Primer deploy a producción
10. Pruebas de humo en producción

**Entregables:**
- Sistema desplegado en rematicos.reinbor.cloud
- CI/CD funcionando
- Documentación de despliegue y mantenimiento

---

## 8. Reglas de Calidad del Código

### 8.1 Principios SOLID

- **S**ingle Responsibility: Cada función/clase/module tiene una sola responsabilidad.
- **O**pen/Closed: Módulos abiertos para extensión, cerrados para modificación.
- **L**iskov Substitution: Los proveedores de TTS son intercambiables.
- **I**nterface Segregation: Interfaces pequeñas y específicas.
- **D**ependency Inversion: Módulos dependen de abstracciones.

### 8.2 Clean Architecture

```
apps/api/src/
├── routes/          # Interfaz externa (HTTP)
├── controllers/     # Casos de uso (orquestación)
├── services/        # Lógica de negocio
├── repositories/    # Acceso a datos
├── models/          # Entidades de dominio
└── types/           # Contratos de datos
```

### 8.3 Convenciones

- TypeScript estricto (`strict: true`)
- Nombres en camelCase para variables/functions
- Nombres en PascalCase para interfaces/types
- Nombres en UPPER_SNAKE_CASE para constantes
- Nombres de archivos en kebab-case
- Funciones puras donde sea posible
- Inmutabilidad preferida
- Error handling con Result pattern o custom errors
- Documentación JSDoc en funciones públicas

### 8.4 Herramientas

| Herramienta | Propósito |
|-------------|-----------|
| ESLint | Linting de código |
| Prettier | Formateo de código |
| Husky | Git hooks |
| lint-staged | Lint en staged files |
| Vitest | Testing |
| Prisma | ORM y migraciones |
| zod | Validación de esquemas |
| tsx | Ejecución de TypeScript |

### 8.5 Testing

- Unit tests para servicios y utilidades
- Integration tests para rutas de API
- E2E tests para flujos críticos
- Cobertura mínima: 80%

---

## 9. Configuración de Entorno

### 9.1 Variables de Entorno

```env
# .env.example

# ─── DATABASE ────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/rematicos"
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/rematicos_test"

# ─── REDIS ───────────────────────────────────
REDIS_URL="redis://localhost:6379"

# ─── AUTH ────────────────────────────────────
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-secret-min-32-chars"
REFRESH_TOKEN_EXPIRES_IN="7d"

# ─── SERVER ──────────────────────────────────
API_PORT="4000"
WEB_PORT="3000"
WS_PORT="4001"
NODE_ENV="development"

# ─── TTS ─────────────────────────────────────
TTS_PROVIDER="openai"
OPENAI_API_KEY="your-openai-api-key"
TTS_VOICE="alloy"
TTS_SPEED="1.0"
TTS_VOLUME="1.0"
TTS_LANGUAGE="es-CO"

# ─── BRE-B ───────────────────────────────────
BREB_ENABLED="false"
BREB_API_URL=""
BREB_API_KEY=""
BREB_POLLING_INTERVAL="60"

# ─── NOTIFICATIONS ───────────────────────────
NOTIFICATION_EMAIL_ENABLED="false"
NOTIFICATION_EMAIL_SMTP_HOST=""
NOTIFICATION_EMAIL_SMTP_PORT="587"
NOTIFICATION_EMAIL_FROM=""

# ─── WEBHOOKS ────────────────────────────────
WEBHOOK_SECRET="your-webhook-secret"

# ─── BACKUP ──────────────────────────────────
BACKUP_ENABLED="true"
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS="30"
```

---

## 10. CHANGELOG

### v0.0.0 — Plan Inicial
- Creación del PLAN_DESARROLLO.md
- Definición de arquitectura
- Definición de entidades y relaciones
- Definición de eventos
- Definición de módulos
- División en fases

---

## 11. Decisiones Técnicas

| Decisión | Justificación |
|----------|---------------|
| Next.js 15 | Framework React moderno con App Router, SSR/SSG, API routes |
| Node.js backend separado | Permite escalado independiente del frontend |
| PostgreSQL | Base de datos relacional robusta, gratuita, escalable |
| Prisma | ORM type-safe, migraciones automáticas, excelente DX |
| Redis | Cache + Pub/Sub para eventos, ligero y rápido |
| Socket.IO | WebSocket con fallback, fácil de usar, rooms |
| Docker | Reproducibilidad, escalabilidad, aislamiento de servicios |
| Nginx | Reverse proxy robusto, SSL termination, load balancing |
| JWT + Refresh Tokens | Stateless auth con posibilidad de revocar tokens |
| shadcn/ui | Componentes accesibles, customizables, Tailwind-native |
| TailwindCSS | Utility-first CSS, rápido de desarrollar, consistente |
| TypeScript estricto | Type safety en todo el stack |
| Monorepo con workspaces | Compartir código entre frontend y backend |
| Provider Pattern para TTS | Permite cambiar proveedores sin modificar el core |
| Event Bus con Redis | Desacoplamiento total entre módulos |
| Repository Pattern | Abstracción del acceso a datos, facilita testing |

---

## 12. Próximos Pasos

1. ✅ Analizar el proyecto
2. ✅ Diseñar la arquitectura
3. ✅ Proponer estructura de carpetas
4. ✅ Definir entidades y relaciones
5. ✅ Definir eventos
6. ✅ Definir módulos
7. ✅ Crear PLAN_DESARROLLO.md
8. ✅ Dividir en fases
9. ✅ Fase 0: Setup del proyecto (monorepo, Docker, Prisma)
10. ✅ Fase 1: Backend base + Auth (JWT, roles, middleware)
11. ✅ Fase 3: Dashboard administrativo (login, dashboard, pagos)
12. ✅ Fase 4: Verificación manual de pagos Nequi (PostgreSQL)
13. ✅ Publicidad IA (upload, RMBG-1.4, Sharp, composición)
14. ✅ Tests (55 tests passing)
15. ✅ Validación backend (Zod, error handler, logging)
16. ✅ Protección de rutas (backend + frontend)
17. ⬜ Fase 2: Frontend pública completa (formulario contacto, SEO)
18. ⬜ Fase 5: Panel en tiempo real (mejoras al POS)
19. ⬜ Fase 6: TTS con proveedores externos (OpenAI, Google)
20. ⬜ Fase 7: Automatizaciones
21. ⬜ Fase 8: IA y módulos futuros
22. ⬜ Fase 9: Seguridad y optimización avanzada
23. ⬜ Fase 10: Despliegue en producción
