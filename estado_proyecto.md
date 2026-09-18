# Estado del Proyecto - Remáticos

> **Archivo para dar contexto rápido a IA (ChatGPT, Cursor, etc.).**
> Última actualización: Septiembre 2026

---

## 1. Qué es

**Remáticos** (Adornos Remático) es una tienda física de adornos y materiales creativos en Villavicencio, Meta, Colombia. El proyecto es un **monorepo** que administra:

- Un **panel de administración** (admin) para gestionar productos, pagos y publicidad con IA
- Una **tienda pública** (storefront) para que los clientes vean productos y armen listas de compra por WhatsApp
- Una **API REST** que conecta todo con PostgreSQL y Redis

**Dominios:**
| Servicio | URL |
|----------|-----|
| Tienda pública | `https://rematicos.reinbor.cloud` |
| Admin panel | `https://rematicosadmin.reinbor.cloud` |

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Monorepo | Turborepo + npm workspaces |
| Backend API | Express.js (TypeScript) |
| Frontend admin | Next.js 15, React 19, Tailwind CSS 4 |
| Frontend tienda | Next.js 15, React 19, Tailwind CSS 4 |
| Base de datos | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 |
| WebSocket | Socket.IO |
| Auth | JWT (access + refresh tokens), bcryptjs |
| IA imágenes | Python FastAPI + rembg + Stable Diffusion |
| Validación | Zod |
| Logs | Winston |
| Proxy | Nginx (SSL, WebSocket, reverse proxy) |
| Deploy | Docker + Docker Compose + Let's Encrypt |
| TTS | Web Speech API (navegador, locale es-CO) |

---

## 3. Estructura de carpetas

```
rematicos/
├── apps/
│   ├── api/                    # Express.js API (puerto 4000)
│   │   ├── src/
│   │   │   ├── app.ts          # Express app (middleware, CORS, rutas)
│   │   │   ├── index.ts        # Entry point (HTTP server)
│   │   │   ├── websocket/      # Socket.IO (path /ws, puerto 4001)
│   │   │   ├── middleware/     # auth, errorHandler, rateLimiter, validation
│   │   │   ├── routes/         # Todas las rutas API
│   │   │   ├── services/       # PaymentService, VerificationService
│   │   │   ├── modules/        # Módulo publicidad (IA)
│   │   │   ├── utils/          # Logger (Winston)
│   │   │   └── types/          # Express type augmentation
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema de base de datos
│   │   └── uploads/            # Imágenes subidas (vol en prod)
│   │
│   ├── web/                    # Panel Admin Next.js (puerto 3000)
│   │   └── app/
│   │       ├── login/          # Login page
│   │       ├── admin/          # Layout con sidebar
│   │       │   ├── products/   # CRUD productos COMPLETO
│   │       │   ├── publicidad-ia/  # Generador de publicidad con IA
│   │       │   ├── customers/  # Placeholder
│   │       │   └── settings/   # Placeholder
│   │       ├── (public)/       # Páginas públicas (about, catalog, etc.)
│   │       └── lib/            # api.ts, auth.tsx, socket.ts, voice.ts
│   │
│   └── storefront/             # Tienda pública Next.js (puerto 3001)
│       └── app/
│           ├── (shop)/
│           │   ├── products/           # Catálogo + detalle [slug]
│           │   ├── shopping-list/      # Lista de compra + WhatsApp
│           │   ├── location/           # Ubicación de la tienda
│           │   └── components/         # AddToListModal, ShoppingListButton
│           └── lib/
│               └── shopping-list-context.tsx  # Context + localStorage
│
├── packages/
│   ├── events/         # EventBus (EventEmitter + Redis opcional)
│   ├── shared/         # Constantes + validators Zod
│   ├── payments/       # Tipos de pago
│   ├── notifications/  # Interfaz TTS
│   ├── database/       # Prisma client (cache del engine)
│   ├── ui/             # Stub (vacío)
│   ├── auth/           # Stub (vacío)
│   ├── admin/          # Stub (vacío)
│   └── automations/    # Stub (vacío)
│
├── services/
│   └── image-ai/       # Python FastAPI (puerto 7000)
│       ├── main.py     # Endpoints de IA
│       ├── rembg_service.py      # Remoción de fondo
│       ├── diffusion_service.py  # Stable Diffusion
│       └── composer.py           # Composición de imagen PIL
│
├── infra/
│   ├── docker/         # Dockerfiles (api, web, storefront, nginx)
│   └── nginx/          # nginx.conf (SSL, proxy, WebSocket)
│
├── docker-compose.yml          # Desarrollo
├── docker-compose.prod.yml     # Producción
├── deploy.sh                   # Script de deploy
├── DEPLOY.md                   # Guía de despliegue
├── REGLAS.md                   # Reglas de desarrollo
├── estado_proyecto.md          # Este archivo
└── turbo.json                  # Config de Turborepo
```

---

## 4. Base de datos (Prisma)

### Modelos

```
User              → Usuarios del admin (ADMIN/USER)
Payment           → Pagos QR Bre-B tracking
AuditLog          → Registro de auditoría
Setting           → Configuraciones clave-valor
AdImage           → Imágenes de publicidad generadas con IA
PaymentVerification → Verificación/reconciliación de pagos
Category          → Categorías de productos
Product           → Productos del catálogo
  ├── ProductImage   → Imágenes del producto (cascade)
  ├── ProductOption  → Atributos (Color, Tamaño, etc.)
  │   └── OptionValue → Valores del atributo (Rojo, Azul, etc.)
  └── ProductVariant → Variantes del producto
```

### Relaciones importantes
- `Category 1──* Product` (cascade)
- `Product 1──* ProductImage` (cascade)
- `Product 1──* ProductOption` (cascade)
- `ProductOption 1──* OptionValue` (cascade)

### Enums
- `ProductStatus`: DRAFT, PUBLISHED, UNAVAILABLE, ARCHIVED
- `UserRole`: ADMIN, USER
- `VerificationStatus`: PENDIENTE, VERIFICADA, DISCREPANCIA, RECHAZADA

---

## 5. API - Endpoints completos

### Autenticación (`/api/auth`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | No | Registrar usuario |
| POST | `/login` | No | Login (retorna tokens) |
| POST | `/refresh` | No | Renovar tokens |
| GET | `/me` | Sí | Usuario actual |

### Productos (`/api/products`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/categories` | No | Listar categorías activas |
| GET | `/` | No | Listar productos publicados (filtros: search, category, option, optionValue) |
| GET | `/admin/list` | Admin | Listar TODOS los productos |
| GET | `/:slug` | No | Producto por slug |
| POST | `/categories` | Admin | Crear categoría |
| POST | `/` | Admin | Crear producto (con imágenes y opciones) |
| PUT | `/:id` | Admin | Actualizar producto completo |
| PATCH | `/:id` | Admin | Actualizar producto parcial |
| DELETE | `/:id` | Admin | Eliminar producto (cascade) |
| POST | `/:id/images` | Admin | Agregar imágenes |
| PUT | `/:id/images/reorder` | Admin | Reordenar imágenes |
| DELETE | `/:id/images/:imageId` | Admin | Eliminar imagen |
| POST | `/:id/options` | Admin | Agregar atributo con valores |
| PUT | `/:id/options/:optionId` | Admin | Actualizar atributo |
| DELETE | `/:id/options/:optionId` | Admin | Eliminar atributo |
| POST | `/:id/options/:optionId/values` | Admin | Agregar valor |
| PUT | `/:id/options/:optionId/values/:valueId` | Admin | Actualizar valor |
| DELETE | `/:id/options/:optionId/values/:valueId` | Admin | Eliminar valor |
| POST | `/:id/variants` | Admin | Agregar variante |
| DELETE | `/:id/variants/:variantId` | Admin | Eliminar variante |

### Upload (`/api/upload`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/` | Admin | Subir imágenes (multer, max 12, 10MB c/u) |

### Pagos (`/api/payments`) - Todo requiere auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar pagos (filtros: status, dateFrom, dateTo, page) |
| GET | `/stats` | Estadísticas de hoy |
| GET | `/recent` | Pagos recientes |
| GET | `/:id` | Pago por ID |

### Verificaciones (`/api/verifications`) - Todo requiere auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/stats` | Estadísticas |
| GET | `/` | Listar (filtros: status, search, date) |
| GET | `/:id` | Obtener una |
| POST | `/` | Crear verificación |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

### Publicidad IA (`/api/publicidad`) - Sin auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/generar` | Generar publicidad (imagen + texto + estilo + template) |
| POST | `/remover-fondo` | Remover fondo de imagen |
| GET | `/templates` | 12 formatos disponibles |
| GET | `/styles` | 14 estilos visuales |
| GET | `/template-config/:id` | Configuración de template |
| GET | `/history` | Historial paginado |
| GET | `/history/:id` | Item del historial |
| DELETE | `/history/:id` | Eliminar item |

### Simulador (`/api/simulator`) - Sin auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/payment` | Simular pago específico |
| POST | `/random` | Generar pago aleatorio colombiano |

### Otros
| Mount | Descripción |
|-------|-------------|
| `/api/audit` | Logs de auditoría (auth) |
| `/api/settings` | Configuraciones key-value (auth) |
| `/uploads/*` | Archivos estáticos (imágenes subidas) |
| `/health` y `/api/health` | Health checks |

---

## 6. Funcionalidades por app

### Admin Panel (`apps/web`)

**Funcional:**
- **Login** con JWT (access + refresh tokens)
- **Productos**: CRUD completo - crear, editar, eliminar, subir imágenes, drag-to-reorder, atributos con imágenes por valor, unidades de venta
- **Publicidad IA**: Subir foto → remover fondo → elegir estilo/formato → generar publicidad profesional → descargar. 14 estilos, 12 formatos (Instagram, Facebook, WhatsApp, YouTube, etc.)
- **Dashboard con WebSocket**: Notificaciones de pagos en tiempo real, anuncios de voz (TTS en español)
- **Sidebar layout** con navegación

**Placeholder (no funcional):**
- Clientes
- Configuraciones

### Storefront (`apps/storefront`)

**Funcional:**
- **Catálogo de productos**: Búsqueda, filtro por categoría, filtro por atributos
- **Detalle de producto**: Carrusel de imágenes (producto + atributos), selector de opciones que mueve el carrusel, animaciones
- **Lista de compra**: Agregar productos con atributos y cantidad, persiste en localStorage, enviar por WhatsApp
- **Ubicación**: Dirección de la tienda con link a Google Maps
- **Diseño responsive**: Mobile-first, header sticky, footer con info

### API (`apps/api`)

**Funcional:**
- CRUD completo de productos con imágenes, atributos, valores con imagen, variantes
- Autenticación JWT con refresh tokens
- Upload de imágenes con multer
- Sistema de pagos con simulación colombiana (Bancolombia, Nequi, etc.)
- Verificación/reconciliación de pagos
- Generación de publicidad con IA (Python FastAPI)
- EventBus para eventos en tiempo real
- WebSocket para notificaciones
- Rate limiting, CORS, Helmet security headers

### Python Image AI (`services/image-ai`)

**Funcional:**
- Remoción de fondo con rembg (U2-Net)
- Generación de fondos con Stable Diffusion (SDXL/SD 1.5)
- Composición de publicidad con PIL (producto + fondo + textos)
- 7 estilos, 4 formatos

---

## 7. Arquitectura de deploy

```
Internet
    │
    ▼
┌─────────────────────────┐
│  Nginx (:80/:443)       │ ← SSL + reverse proxy
│  rematicos.reinbor.cloud│
│  rematicosadmin.cloud   │
└────────┬────────────────┘
         │
    ┌────┼────────────────┐
    │    │                │
    ▼    ▼                ▼
 Storefront  Admin      API
 :3001       :3000      :4000
 (Next.js)  (Next.js)  (Express)
                         │
                    ┌────┼────┐
                    ▼    ▼    ▼
                PostgreSQL Redis  /uploads
                :5432      :6379  (volume)
```

**Docker Compose Prod:** api, web, storefront, postgres, redis, nginx, certbot

---

## 8. Variables de entorno clave

```env
# Base de datos
DATABASE_URL=postgresql://rematicos:PASSWORD@postgres:5432/rematicos
REDIS_URL=redis://:PASSWORD@redis:6379

# Auth (generar con: openssl rand -base64 48)
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...

# Dominios
WEB_URL=https://rematicosadmin.reinbor.cloud
STORE_URL=https://rematicos.reinbor.cloud

# Puertos
API_PORT=4000
WEB_PORT=3000
STORE_PORT=3001
WS_PORT=4001
```

---

## 9. Cómo correr en desarrollo

```bash
# 1. Levantar infraestructura
docker compose up -d postgres redis

# 2. Instalar dependencias
npm install

# 3. Push del schema a la DB
npm run db:push

# 4. Seed (si existe)
npm run db:seed --workspace=apps/api

# 5. Correr todo en dev
npm run dev
```

- Admin: http://localhost:3000
- Storefront: http://localhost:3001
- API: http://localhost:4000
- API health: http://localhost:4000/health

---

## 10. Números de contacto

| Concepto | Valor |
|----------|-------|
| WhatsApp tienda | +57 311 3487967 |
| wa.me link | `https://wa.me/573113487967` |
| Dirección | Calle 40 #15-23, Villavicencio, Meta |
| Moneda | COP (Peso colombiano) |
| Locale | es-CO |

---

## 11. Notas importantes para IA

1. **El admin usa `output: "standalone"` en Next.js** para Docker. El storefront también.
2. **Las imágenes de productos** se suben a `/uploads/` y se sirven vía nginx. Las URLs se generan con `STORE_URL` en el backend.
3. **Los option values pueden tener imagen** (`imageUrl` en `OptionValue`). Estas imágenes se muestran en el carrusel del storefront cuando se selecciona ese atributo.
4. **La lista de compra** usa localStorage, no backend. Se envía por WhatsApp con el número 573113487967.
5. **El módulo de publicidad** depende de un servicio Python en puerto 7000. Si no está corriendo, la generación de publicidad falla.
6. **CORS** permite: WEB_URL, STORE_URL, localhost:3000, localhost:3001.
7. **Rate limit**: 200 requests / 15 min en `/api/`.
8. **Los stubs** (ui, auth, admin, automations) están vacíos y no se usan.
9. **El archivo `.env` nunca se sube a git** (está en .gitignore). Usar `.env.production.example` como referencia.
10. **Deploy**: `git pull && ./deploy.sh` en el VPS.
