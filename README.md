# Adornos Rematico Villavicencio — Plataforma Web Oficial

Plataforma empresarial moderna para la gestión integral de Adornos Rematico Villavicencio.

## Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript + TailwindCSS 4
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Cache/Eventos**: Redis + Socket.IO
- **Autenticación**: JWT + Refresh Tokens + bcryptjs
- **Validación**: Zod
- **Despliegue**: Docker + Nginx + HTTPS
- **Testing**: Vitest + Supertest

## Estructura del Proyecto

```
rematicos/
├── apps/
│   ├── web/                    # Next.js 15 (Frontend + Admin)
│   │   ├── app/
│   │   │   ├── admin/          # Panel administrativo
│   │   │   │   ├── login/      # Login funcional
│   │   │   │   ├── dashboard/  # Dashboard con datos reales
│   │   │   │   ├── payments/   # Historial de pagos
│   │   │   │   ├── verificaciones/ # Verificación manual de pagos
│   │   │   │   ├── publicidad-ia/  # Generador de publicidad con IA
│   │   │   │   ├── products/
│   │   │   │   ├── customers/
│   │   │   │   └── settings/
│   │   │   └── (public)/       # Páginas públicas
│   │   ├── components/         # Componentes UI
│   │   └── lib/                # API client, auth, socket, voice
│   │
│   └── api/                    # Node.js Backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth/       # Register, Login, Refresh, Me
│       │   │   ├── payments/   # CRUD pagos
│       │   │   ├── verifications/ # Verificación manual Nequi
│       │   │   ├── audit/
│       │   │   ├── settings/
│       │   │   └── simulator/
│       │   ├── services/
│       │   ├── middleware/     # Auth, validation, error handler
│       │   └── modules/publicidad/ # Módulo de publicidad IA
│       └── prisma/
│           ├── schema.prisma   # Payment, User, PaymentVerification, etc.
│           └── seed.ts         # Usuario admin inicial
│
├── packages/
│   ├── shared/       # Tipos y validadores compartidos
│   ├── events/       # Event Bus (Redis Pub/Sub)
│   └── payments/     # Tipos de proveedores de pago
│
├── infra/
│   ├── docker/       # Dockerfiles
│   └── nginx/        # Configuración de Nginx
│
└── docs/
    ├── CHANGELOG.md
    └── ARCHITECTURE.md
```

## Estado Actual

### Funcionalidades implementadas

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Auth (JWT)** | ✅ | Register, Login, Refresh, Me. Roles ADMIN/USER. |
| **Verificación de Pagos** | ✅ | CRUD completo. Persistencia PostgreSQL. Comparación automática. |
| **Dashboard** | ✅ | Stats reales del API. Pagos recientes. |
| **Pagos** | ✅ | Listar, filtrar, paginación. Simulador de pagos. |
| **Publicidad IA** | ✅ | Upload, eliminación de fondo (RMBG-1.4), composición con Sharp. |
| **Protección de Rutas** | ✅ | JWT middleware en backend. Auth context en frontend. |
| **Validación Backend** | ✅ | Zod en todas las rutas admin. Errores consistentes. |
| **Manejo de Errores** | ✅ | ErrorHandler centralizado. Códigos de error consistentes. |
| **Logging** | ✅ | Winston con console + file transports. |
| **WebSocket** | ✅ | Socket.IO para pagos en tiempo real. |
| **TTS (Voz)** | ✅ | Web Speech API en el navegador. |
| **Tests** | ✅ | 55 tests (verificaciones, auth, validators, API, events). |

## Inicio Rápido

### Requisitos

- Node.js >= 22
- PostgreSQL
- Docker + Docker Compose (opcional)

### Desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/ProyectosReinbor/rematicosadmin.git
cd rematicos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores reales

# Generar cliente Prisma
npm run db:generate

# Crear tablas en PostgreSQL
npm run db:push

# Crear usuario admin inicial
cd apps/api && npm run db:seed

# Iniciar en modo desarrollo
npm run dev
```

### URLs

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- API: http://localhost:4000
- WebSocket: ws://localhost:4001

### Credenciales por defecto (seed)

- Email: `admin@rematicos.com`
- Contraseña: `admin123`

> **Importante**: Cambiar esta contraseña después del primer login en producción.

## Variables de Entorno

Ver `.env.example` para la lista completa. Las variables críticas son:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar access tokens (mín. 32 chars) |
| `REFRESH_TOKEN_SECRET` | Secreto para firmar refresh tokens |
| `WEB_URL` | URL del frontend (para CORS) |

## Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar todos los servicios

# Build
npm run build            # Build de todas las apps

# Base de datos
npm run db:generate      # Generar Prisma Client
npm run db:push          # Sincronizar schema con DB
npm run db:migrate       # Crear migración
npm run db:studio        # Abrir Prisma Studio
cd apps/api && npm run db:seed  # Crear usuario admin

# Testing
cd apps/api && npm test  # Ejecutar tests

# Lint
cd apps/web && npm run lint
```

## Licencia

Propietario — Adornos Rematico Villavicencio
