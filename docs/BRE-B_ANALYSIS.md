# Análisis BRE-B — Adornos Rematico Villavicencio

## 0. Estado de la Investigación

**Fecha del análisis:** Agosto 2026
**Estado:** PRELIMINAR — Se requiere confirmación con la entidad emisora de BRE-B y/o los bancos participantes.

---

## 1. ¿Qué es BRE-B?

**Nota importante:** El término "BRE-B" en el contexte de pagos en Colombia no corresponde a un estándar o plataforma de pago ampliamente documentada en fuentes públicas verificadas. Las siguientes secciones documentan lo que se conoce y las hipótesis más probables, dejando toda la arquitectura preparada para la integración real.

### Hipótesis 1: Red de Pagos Interbancaria (Bancolombia u otro banco)
Algunos bancos colombianos utilizan redes de transferencia inmediata o PSE (Pago Seguro en Línea) que podrían referirse internamente como "BRE-B" o un acrónimo similar.

### Hipótesis 2: Sistema de Compensación Bancaria
El sistema de compensación bancaria en Colombia (operado por la Cámara de Compensación Electrónica) podría usar un acrónimo similar para sus transacciones entre bancos.

### Hipótesis 3: Plataforma de Pagos Específica
BRE-B podría ser una plataforma de pagos específica de un banco o red de comercios que requiere documentación oficial para su integración.

### Conclusión del Análisis
**No se puede confirmar la existencia de una API pública, webhooks oficiales o documentación abierta para BRE-B sin contactar directamente a la entidad emisora.** La arquitectura del sistema está diseñada para acomodar cualquier fuente de pagos mediante el patrón Provider.

---

## 2. Arquitectura Preparada para BRE-B

### 2.1 Patrón Provider

El módulo de pagos utiliza una interfaz abstracta `PaymentProvider` que permite intercambiar la fuente de datos sin modificar el core del sistema:

```
apps/api/src/routes/payments/services/
├── provider.interface.ts    # Interface abstracta del proveedor
├── payment-service.ts       # Servicio principal (independiente del proveedor)
├── breb-provider.ts         # Proveedor BRE-B (placeholder)
├── mock-provider.ts         # Proveedor mock para desarrollo
└── payment-validator.ts     # Validador de datos de pagos
```

### 2.2 Flujo de Integración

```
┌─────────────────────────────────────────────────────────────┐
│                    Flujo de Integración BRE-B                  │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│  Opción A: Webhook (preferida)                                │
│  ┌──────────┐    POST /api/payments/webhook    ┌──────────┐ │
│  │ Banco/   │ ──────────────────────────────► │  API     │ │
│  │ BRE-B    │                                 │  Backend │ │
│  └──────────┘    200 OK                       └────┬─────┘ │
│                                                     │         │
│                                              Emitir   │         │
│                                              evento   │         │
│                                                     ▼         │
│                                              Payment.Received │
│                                                     │         │
│                                              ┌──────┴─────┐  │
│                                              ▼     ▼      ▼  │
│                                         TTS   Dashboard  Audit│
│                                                                 │
│  Opción B: Polling (fallback)                                 │
│  ┌──────────┐    GET /api/payments/verify    ┌──────────┐   │
│  │ Sistema  │ ◄──────────────────────────── │  API     │   │
│  │ Polling  │    cada N minutos              │  Backend │   │
│  └──────────┘                                └────┬─────┘   │
│                                                  │           │
│                                            Consultar API    │
│                                            del banco       │
│                                                  │           │
│                                                  ▼           │
│                                            Procesar pago     │
│                                                  │           │
│                                                  ▼           │
│                                            Emitir evento     │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Interfaz del Proveedor

```typescript
interface PaymentProvider {
  /** Nombre del proveedor */
  name: string;

  /** Inicializar el proveedor con configuración */
  initialize(config: Record<string, unknown>): Promise<void>;

  /** Consultar un pago por referencia */
  checkPayment(reference: string): Promise<PaymentVerificationResult>;

  /** Listar pagos con filtros */
  listPayments(filters: PaymentFilters): Promise<Payment[]>;

  /** Verificar la firma de un webhook entrante */
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;

  /** Obtener la lista de bancos compatibles */
  getSupportedBanks(): Promise<string[]>;
}
```

### 2.4 Estructura de Datos del Pago

```typescript
interface PaymentVerificationResult {
  /** ID único del pago en el sistema */
  id: string;

  /** Referencia de la transacción */
  reference: string;

  /** Banco emisor (puede ser null) */
  bank: string | null;

  /** Nombre del comprador */
  buyerName: string;

  /** Documento del comprador (puede ser null) */
  buyerDocument: string | null;

  /** Valor del pago */
  value: number;

  /** Moneda (COP por defecto) */
  currency: string;

  /** Fecha y hora del pago */
  dateTime: Date;

  /** Estado del pago */
  status: "PENDING" | "VALIDATED" | "CONFIRMED" | "FAILED" | "REJECTED";

  /** Número de comprobante (si existe) */
  receiptNumber: string | null;

  /** Canal de pago (presencial, en línea, etc.) */
  channel: string | null;

  /** Metadatos adicionales del proveedor */
  metadata: Record<string, unknown>;
}
```

---

## 3. Datos a Almacenar por Pago

Cuando se detecte un pago BRE-B, el sistema almacenará:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del registro |
| `reference` | String | Referencia de la transacción |
| `bank` | String \| null | Banco emisor |
| `buyerName` | String | Nombre del comprador |
| `buyerDocument` | String \| null | Documento de identidad |
| `value` | Decimal | Valor del pago |
| `currency` | String | Moneda (COP) |
| `dateTime` | DateTime | Fecha y hora del pago |
| `status` | Enum | PENDING, VALIDATED, CONFIRMED, FAILED, REJECTED, REFUNDED |
| `receiptNumber` | String \| null | Número de comprobante |
| `channel` | String \| null | Medio de pago |
| `metadata` | JSON | Datos adicionales del proveedor |
| `userId` | UUID \| null | Usuario que registró el pago |
| `saleId` | UUID \| null | Venta asociada |
| `createdAt` | DateTime | Fecha de creación del registro |
| `updatedAt` | DateTime | Fecha de última actualización |

---

## 4. Acciones Pendientes

1. **Contactar a la entidad emisora de BRE-B** para obtener:
   - Documentación de API
   - Credenciales de acceso (sandbox y producción)
   - URLs de webhooks
   - Bancos compatibles
   - Limitaciones y restricciones

2. **Implementar el proveedor BRE-B** con las credenciales reales

3. **Configurar el endpoint de webhook** en la entidad emisora

4. **Configurar el intervalo de polling** como fallback

5. **Probar en sandbox** antes de habilitar en producción

---

## 5. Arquitectura Preparada

Toda la infraestructura para recibir y procesar pagos BRE-B está lista:

- ✅ Schema de base de datos para pagos
- ✅ Provider interface abstracta
- ✅ Mock provider para desarrollo
- ✅ Endpoints de consulta y verificación
- ✅ Evento `Payment.Received`
- ✅ Integración con TTS (notificación por voz)
- ✅ Integración con dashboard en tiempo real
- ✅ Integración con auditoría
- ✅ Exportación de datos (PDF, Excel, CSV)
- ✅ Filtros y búsqueda
- ⏳ Implementación del proveedor BRE-B real (pendiente de autorización)
- ⏳ Configuración de webhooks (pendiente de credenciales)
- ⏳ Configuración de polling (pendiente de API del banco)