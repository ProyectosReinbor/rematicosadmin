# Arquitectura — Adornos Rematico Villavicencio

## Visión General

Plataforma empresarial como monorepo con frontend Next.js 15, backend Express, PostgreSQL, Redis y WebSocket.

## Componentes

### 1. Frontend (Next.js 15 + React 19)

- **Admin**: Panel con sidebar, login, dashboard, pagos, verificaciones, publicidad IA
- **Público**: Páginas de información (about, catalog, contact, faq, gallery, location)
- **Auth**: AuthContext con JWT en localStorage, auto-refresh de tokens
- **WebSocket**: Socket.IO para pagos en tiempo real
- **TTS**: Web Speech API para anuncios de voz

### 2. Backend (Express + TypeScript)

- **Auth**: JWT (access 15min + refresh 7d), bcryptjs (12 rounds), roles ADMIN/USER
- **API REST**: CRUD completo de pagos, verificaciones, settings, audit
- **Validación**: Zod en todas las rutas admin
- **Error handling**: ErrorHandler centralizado con códigos consistentes
- **Logging**: Winston (console + file)
- **Rate limiting**: express-rate-limit (200 req/15min en /api/)

### 3. Base de Datos (PostgreSQL + Prisma)

**Modelos implementados:**

| Modelo | Descripción |
|--------|-------------|
| Payment | Pagos recibidos (amount: Decimal 12,2) |
| PaymentVerification | Verificación manual de pagos Nequi |
| User | Usuarios con roles (ADMIN/USER) |
| AuditLog | Registro de acciones del sistema |
| Setting | Configuración global (key-value) |
| AdImage | Imágenes de publicidad generadas |

**Enums:**
- VerificationStatus: PENDIENTE, VERIFICADA, DISCREPANCIA, RECHAZADA
- VerificationMethod: MANUAL
- UserRole: ADMIN, USER

### 4. Eventos (Redis Pub/Sub)

- PaymentReceived — Pago detectado
- PaymentSaved — Pago guardado en DB
- VoiceAnnouncementRequested — Solicitud de anuncio TTS

### 5. Módulo Publicidad IA

- Upload de producto → Eliminación de fondo (RMBG-1.4) → Edición → Composición (Sharp) → Descarga
- Validación server-side: tipo MIME, tamaño (10MB), base64
- Templates: 6 plantillas predefinidas
- Estilos: 7 estilos visuales
- Formatos: Instagram, Historia, Facebook, WhatsApp

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/health | API health check |
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Renovar tokens |
| POST | /api/simulator/payment | Simular pago |
| POST | /api/simulator/random | Pago aleatorio |

### Protegidos (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/auth/me | Usuario actual |
| GET | /api/payments | Listar pagos |
| GET | /api/payments/stats | Estadísticas de pagos |
| GET | /api/payments/recent | Pagos recientes |
| GET | /api/payments/:id | Detalle de pago |
| POST | /api/verifications | Crear verificación |
| GET | /api/verifications | Listar verificaciones |
| GET | /api/verifications/stats | Estadísticas |
| GET | /api/verifications/:id | Detalle |
| PUT | /api/verifications/:id | Actualizar |
| DELETE | /api/verifications/:id | Eliminar |
| GET | /api/audit | Logs de auditoría |
| GET | /api/settings | Configuración |
| PUT | /api/settings | Actualizar config |
| POST | /api/publicidad/generar | Generar publicidad |
| POST | /api/publicidad/remover-fondo | Eliminar fondo |

## Frontend Routes

| Ruta | Descripción | Auth |
|------|-------------|------|
| / | Dashboard de pagos en tiempo real | No |
| /admin/login | Login | No |
| /admin/dashboard | Dashboard admin | Sí |
| /admin/payments | Historial de pagos | Sí |
| /admin/verificaciones | Verificación de pagos Nequi | Sí |
| /admin/publicidad-ia | Generador de publicidad IA | Sí |
| /admin/products | Productos (stub) | Sí |
| /admin/customers | Clientes (stub) | Sí |
| /admin/settings | Configuración (stub) | Sí |
| /about, /catalog, etc. | Páginas públicas | No |

## Seguridad

- JWT en Authorization header (Bearer token)
- Tokens se renuevan automáticamente en el frontend
- Passwords hasheados con bcrypt (12 rounds)
- Rate limiting en todas las rutas /api/
- Helmet headers (HSTS, X-Content-Type-Options, etc.)
- CORS configurado solo para dominios permitidos
- Validación Zod en todas las rutas admin
- Errores sin stack traces en producción

## Testing

- **Framework**: Vitest + Supertest
- **Cobertura**: 55 tests en 6 archivos
  - verification.test.ts (14 tests)
  - auth.test.ts (13 tests)
  - verification-validator.test.ts (15 tests)
  - api.test.ts (5 tests)
  - event-bus.test.ts (4 tests)
  - simulator-provider.test.ts (4 tests)
