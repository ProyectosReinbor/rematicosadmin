# Publicidad IA - Guía de Instalación y Uso

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Node.js API    │────▶│  Python FastAPI │
│   Next.js 15    │     │   Express        │     │  (Puerto 7000)  │
│   Puerto 3000   │     │   Puerto 4000    │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   rembg          │
                                                  │   (U2-Net)       │
                                                  └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Stable Diffusion │
                                                  │   (Local)        │
                                                  └─────────────────┘
```

## Componentes

### 1. Python FastAPI Service (`services/image-ai/`)

Servicio de IA para procesamiento de imágenes.

**Dependencias:**
- `rembg` - Eliminación de fondo (open source, modelo U2-Net)
- `diffusers` - Stable Diffusion local
- `Pillow` - Manipulación de imágenes
- `FastAPI` - Framework web

**Instalación:**

```bash
cd services/image-ai

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servicio
python main.py
```

El servicio estará disponible en `http://localhost:7000`

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/remove-background` | Eliminar fondo de imagen |
| POST | `/generate-background` | Generar fondo con Stable Diffusion |
| POST | `/generate-advertisement` | Generar publicidad completa |
| GET | `/styles` | Estilos disponibles |
| GET | `/formats` | Formatos disponibles |
| GET | `/health` | Estado del servicio |

### 2. Node.js API (`apps/api/`)

Backend que conecta el frontend con el servicio de IA.

**Variables de entorno:**

```env
AI_PROVIDER="local"
REMBG_SERVICE_URL="http://localhost:7000"
STABLE_DIFFUSION_URL="http://localhost:7860"
PUBLICIDAD_STORAGE_PATH="./uploads/ads"
```

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/publicidad/generar` | Generar publicidad |
| POST | `/api/publicidad/remover-fondo` | Eliminar fondo |
| GET | `/api/publicidad/templates` | Plantillas disponibles |
| GET | `/api/publicidad/styles` | Estilos disponibles |
| GET | `/api/publicidad/history` | Historial |
| DELETE | `/api/publicidad/history/:id` | Eliminar del historial |

### 3. Frontend (`apps/web/`)

Panel administrativo en Next.js 15.

**Ruta:** `/admin/publicidad-ia`

**Componentes:**
- `ProductUploader` - Subida de fotos (drag & drop, cámara)
- `BackgroundRemovalPreview` - Vista previa de eliminación de fondo
- `AdvertisementEditor` - Editor de textos (nombre, precio, oferta)
- `StyleSelector` - Selector de estilos (7 opciones)
- `FormatSelector` - Selector de formatos (Instagram, Historia, Facebook, WhatsApp)
- `GeneratedAdsGallery` - Galería de publicidades creadas

## Pipeline de Procesamiento

```
1. Imagen del producto (JPG/PNG/WebP)
        │
        ▼
2. rembg elimina fondo (U2-Net)
        │
        ▼
3. Producto transparente (PNG)
        │
        ▼
4. Stable Diffusion genera fondo
        │
        ▼
5. Compositor mezcla producto + fondo
        │
        ▼
6. Textos se agregan con Pillow
        │
        ▼
7. Publicidad final (PNG)
```

## Estilos Disponibles

| ID | Nombre | Colores |
|----|--------|---------|
| moderno | Moderno | Azul, gradientes suaves |
| elegante | Elegante | Púrpura, dorado, mármol |
| oferta | Oferta Agresiva | Rojo, amarillo, llamativo |
| minimalista | Minimalista | Blanco, negro, limpio |
| tienda | Tienda Física | Verde, ambiental |
| marketplace | Marketplace | Azul, e-commerce |
| redes | Redes Sociales | Rosa, vibrante |

## Formatos

| ID | Nombre | Dimensiones |
|----|--------|-------------|
| instagram | Instagram Post | 1080x1080 |
| historia | Historia Instagram | 1080x1920 |
| facebook | Facebook Anuncio | 1200x630 |
| whatsapp | WhatsApp Catálogo | 1080x1920 |

## Requisitos del Sistema

### Python
- Python 3.10+
- 8GB+ RAM (para Stable Diffusion)
- GPU recomendada (NVIDIA con CUDA)

### Node.js
- Node.js 22+
- npm 10+

### Hardware Recomendado
- **Mínimo:** CPU 8 cores, 16GB RAM
- **Recomendado:** GPU NVIDIA RTX 3060+, 32GB RAM
- **Óptimo:** GPU NVIDIA RTX 4090, 64GB RAM

## Optimizaciones

### Para CPU (sin GPU)
El servicio funciona en modo CPU pero es más lento:
- Generación de fondo: ~30-60 segundos
- Eliminación de fondo: ~5-10 segundos

### Para GPU
Con GPU NVIDIA:
- Generación de fondo: ~3-5 segundos
- Eliminación de fondo: ~1-2 segundos

### Modelos
- **SDXL:** Mejor calidad, más lento
- **SD 1.5:** Más rápido, calidad aceptable

## Solución de Problemas

### Error: "rembg service not available"
```bash
# Verificar que el servicio Python está corriendo
curl http://localhost:7000/health
```

### Error: "CUDA out of memory"
```bash
# Reducir resolución o usar SD 1.5
# O usar modo CPU
```

### Error: "Model not found"
```bash
# Los modelos se descargan automáticamente la primera vez
# Verificar conexión a internet
```

## APIs Utilizadas (100% Open Source)

| Componente | API/Modelo | Licencia |
|------------|-----------|----------|
| rembg | U2-Net | Apache 2.0 |
| Stable Diffusion | SDXL/SD 1.5 | CreativeML OpenRAIL-M |
| FastAPI | - | MIT |
| Pillow | - | PIL License |

**NO se utilizan APIs pagas:**
- ❌ OpenAI API
- ❌ remove.bg API
- ❌ ClipDrop API
- ❌ Ningún servicio con límites externos
