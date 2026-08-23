# CHANGELOG

## v0.1.0 — Autenticación, Verificaciones y Publicidad IA (2026-08-23)

### Backend

- **Auth completo**: POST /api/auth/register, /login, /refresh, /me
- **JWT + Refresh Tokens**: Access token (15min), Refresh token (7d)
- **Roles**: ADMIN y USER con middleware requireRole()
- **User model**: Prisma schema con passwordHash (bcrypt 12 rounds)
- **Verificaciones Nequi**: API REST completa (CRUD + stats + filtros + paginación)
  - POST /api/verifications — crear verificación
  - GET /api/verifications — listar con filtros (status, search, dateFrom, dateTo)
  - GET /api/verifications/:id — obtener por ID
  - PUT /api/verifications/:id — actualizar
  - DELETE /api/verifications/:id — eliminar
  - GET /api/verifications/stats — estadísticas
- **Comparación automática de pagos**: Decimal de Prisma (no float)
  - PENDIENTE → sin receivedAmount
  - VERIFICADA → receivedAmount === expectedAmount
  - DISCREPANCIA → receivedAmount !== expectedAmount
  - RECHAZADA → manual con motivo
- **Validación backend**: Zod en todas las rutas admin
- **Error handler centralizado**: Códigos de error consistentes (400, 401, 403, 404, 500)
- **Protección de rutas**: JWT middleware en /api/payments, /api/verifications, /api/audit, /api/settings
- **Validación de imágenes**: Solo image/jpeg, image/png, image/webp. Máximo 10MB. Base64 válido.
- **Seed script**: npm run db:seed crea usuario admin inicial
- **Tests**: 55 tests passing (verificaciones, auth, validators, API, events)

### Frontend

- **Login funcional**: Formulario con email/password. Mensajes de error claros.
- **Auth context**: AuthProvider con useAuth() hook. Persistencia en localStorage.
- **Admin layout**: Sidebar con navegación. Protección de rutas. Info de usuario.
- **Página de verificaciones**: Tabla completa con CRUD, búsqueda, filtros, paginación, estadísticas.
- **Dashboard mejorado**: Stats reales del API. Pagos recientes. Tarjetas de herramientas.
- **Pagos**: Tabla con datos reales. Filtros y paginación.
- **API client**: Auto-refresh de tokens. Manejo de 401 → redirect a login.
- **Middleware**: Seguridad (HSTS, X-Content-Type-Options, etc.) + protección de rutas admin.

### Publicidad IA

- **Validación server-side**: Tipo de archivo, tamaño, formato base64.
- **Estado de procesamiento**: Spinner durante eliminación de fondo. Botón deshabilitado.

### Infraestructura

- **Prisma schema**: Modelos PaymentVerification, User (con enums VerificationStatus, VerificationMethod, UserRole)
- **.env.example**: Documentación completa de variables de entorno
- **TypeScript**: 0 errores en apps/api y apps/web
- **Build**: Next.js build exitoso (16 rutas)
- **Tests**: 55 tests passing (6 archivos de test)

---

## v0.0.0 — Plan Inicial

- Creación del PLAN_DESARROLLO.md
- Creación del BRE-B_ANALYSIS.md
- Definición de arquitectura completa
- Definición de entidades y relaciones (Prisma schema)
- Definición de eventos del sistema
- Definición de módulos y responsabilidades
- División en fases de desarrollo
- Setup inicial del monorepo
- Configuración de Docker Compose
- Configuración de Nginx
- Estructura de carpetas creada
