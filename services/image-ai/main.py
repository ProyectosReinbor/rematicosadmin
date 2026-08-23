"""
Servicio de IA para Publicidad - FastAPI
Endpoints para eliminación de fondo y generación de publicidad.
100% open source, sin dependencias de APIs pagas.
"""
import os
import io
import uuid
import logging
import base64
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rembg_service import remove_background, remove_background_simple
from diffusion_service import generate_background, generate_background_fast, cleanup_models
from composer import compose_advertisement, apply_text_overlay

# Configuración
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path(os.getenv("PUBLICIDAD_STORAGE_PATH", "./uploads/ads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Image AI Service",
    description="Servicio de IA para publicidad - 100% open source",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelos de request
class GenerateAdRequest(BaseModel):
    productName: str
    price: str = ""
    offer: str = ""
    style: str = "moderno"
    imageBase64: str
    mimeType: str = "image/png"
    format: str = "instagram"
    textLines: list[dict] = []
    removeBackground: bool = True


class TextConfig(BaseModel):
    text: str
    x: float = 0.5
    y: float = 0.1
    size: int = 48
    color: str = "#FFFFFF"
    bold: bool = True
    align: str = "center"
    shadow: bool = True


# Estilos predefinidos
STYLES = {
    "moderno": {
        "name": "Moderno",
        "primary": "#3B82F6",
        "secondary": "#1E40AF",
        "accent": "#60A5FA",
        "background": "#F8FAFC",
        "text": "#1E293B",
        "prompt_prefix": "modern clean commercial background, soft gradient, professional product photography, studio lighting",
    },
    "elegante": {
        "name": "Elegante",
        "primary": "#7C3AED",
        "secondary": "#6D28D9",
        "accent": "#A78BFA",
        "background": "#FAF5FF",
        "text": "#2E1065",
        "prompt_prefix": "elegant luxurious marble background, gold accents, premium product display, soft studio lighting",
    },
    "oferta": {
        "name": "Oferta Agresiva",
        "primary": "#DC2626",
        "secondary": "#B91C1C",
        "accent": "#FCD34D",
        "background": "#FEF2F2",
        "text": "#7F1D1D",
        "prompt_prefix": "bold red sale background, dynamic commercial design, promotional banner, eye-catching advertising",
    },
    "minimalista": {
        "name": "Minimalista",
        "primary": "#111827",
        "secondary": "#6B7280",
        "accent": "#D1D5DB",
        "background": "#FFFFFF",
        "text": "#111827",
        "prompt_prefix": "minimalist clean white background, simple elegant product display, soft shadows, professional photography",
    },
    "tienda": {
        "name": "Tienda Física",
        "primary": "#059669",
        "secondary": "#047857",
        "accent": "#34D399",
        "background": "#ECFDF5",
        "text": "#064E3B",
        "prompt_prefix": "retail store shelf background, commercial display, warm lighting, shopping environment, product showcase",
    },
    "marketplace": {
        "name": "Marketplace",
        "primary": "#2563EB",
        "secondary": "#1D4ED8",
        "accent": "#60A5FA",
        "background": "#EFF6FF",
        "text": "#1E3A8A",
        "prompt_prefix": "clean marketplace listing background, white clean product photography, e-commerce style, neutral background",
    },
    "redes": {
        "name": "Redes Sociales",
        "primary": "#EC4899",
        "secondary": "#DB2777",
        "accent": "#F472B6",
        "background": "#FDF2F8",
        "text": "#831843",
        "prompt_prefix": "vibrant social media background, colorful gradient, trendy instagram style, eye-catching commercial design",
    },
}


# Dimensiones por formato
FORMATS = {
    "instagram": {"width": 1080, "height": 1080, "name": "Instagram Post"},
    "historia": {"width": 1080, "height": 1920, "name": "Historia Instagram"},
    "facebook": {"width": 1200, "height": 630, "name": "Facebook Anuncio"},
    "whatsapp": {"width": 1080, "height": 1920, "name": "WhatsApp Catálogo"},
}


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "image-ai", "timestamp": datetime.now().isoformat()}


@app.post("/remove-background")
async def remove_bg(
    file: UploadFile = File(...),
    simple: bool = Form(False),
):
    """
    Elimina el fondo de una imagen usando rembg.
    Retorna PNG transparente.
    """
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no soportado: {file.content_type}. Usa JPG, PNG o WEBP.",
        )

    # Validar tamaño (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 10MB.")

    try:
        if simple:
            result = remove_background_simple(contents)
        else:
            result = remove_background(contents, file.content_type)

        return Response(
            content=result,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=nobg_{uuid.uuid4().hex[:8]}.png"
            },
        )
    except Exception as e:
        logger.error(f"Error en remove-background: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")


@app.post("/generate-background")
async def gen_background(
    prompt: str = Form(...),
    width: int = Form(1024),
    height: int = Form(1024),
    style: str = Form("moderno"),
    fast: bool = Form(True),
):
    """
    Genera un fondo usando Stable Diffusion local.
    """
    style_config = STYLES.get(style, STYLES["moderno"])
    full_prompt = f"{style_config['prompt_prefix']}, {prompt}"

    try:
        if fast:
            result = generate_background_fast(full_prompt, width, height)
        else:
            result = generate_background(
                full_prompt,
                width=width,
                height=height,
                num_inference_steps=30,
                guidance_scale=7.5,
            )

        return Response(
            content=result,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=bg_{uuid.uuid4().hex[:8]}.png"
            },
        )
    except Exception as e:
        logger.error(f"Error generando fondo: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando fondo: {str(e)}")


@app.post("/generate-advertisement")
async def generate_advertisement(request: GenerateAdRequest):
    """
    Genera una publicidad completa:
    1. Elimina fondo del producto (opcional)
    2. Genera fondo con Stable Diffusion
    3. Compone producto + fondo + textos
    """
    start_time = datetime.now()

    # Decodificar imagen del producto
    try:
        product_bytes = base64.b64decode(request.imageBase64)
    except Exception:
        raise HTTPException(status_code=400, detail="imageBase64 no es base64 válido.")

    format_config = FORMATS.get(request.format, FORMATS["instagram"])
    width = format_config["width"]
    height = format_config["height"]
    style_config = STYLES.get(request.style, STYLES["moderno"])

    try:
        # Paso 1: Eliminar fondo
        nobg_bytes = product_bytes
        if request.removeBackground:
            logger.info("Paso 1/3: Eliminando fondo del producto...")
            nobg_bytes = remove_background(product_bytes, request.mimeType)

        # Paso 2: Generar fondo
        logger.info("Paso 2/3: Generando fondo con Stable Diffusion...")
        bg_prompt = f"professional product advertisement background for {request.productName}"
        bg_bytes = generate_background_fast(bg_prompt, width, height)

        # Paso 3: Componer
        logger.info("Paso 3/3: Componiendo publicidad final...")
        texts = []

        # Texto del nombre del producto
        texts.append({
            "text": request.productName.upper(),
            "x": 0.5,
            "y": 0.08,
            "size": 56 if width >= 1080 else 36,
            "color": style_config["text"],
            "bold": True,
            "align": "center",
            "shadow": True,
        })

        # Texto del precio
        if request.price:
            texts.append({
                "text": request.price,
                "x": 0.5,
                "y": 0.82,
                "size": 64 if width >= 1080 else 42,
                "color": style_config["primary"],
                "bold": True,
                "align": "center",
                "shadow": True,
            })

        # Texto de oferta
        if request.offer:
            texts.append({
                "text": request.offer,
                "x": 0.5,
                "y": 0.9,
                "size": 40 if width >= 1080 else 28,
                "color": style_config["accent"],
                "bold": True,
                "align": "center",
                "shadow": True,
            })

        # Textos personalizados
        for i, line in enumerate(request.textLines):
            texts.append({
                "text": line.get("text", ""),
                "x": line.get("x", 0.5),
                "y": line.get("y", 0.15 + i * 0.05),
                "size": line.get("fontSize", 32),
                "color": line.get("color", style_config["text"]),
                "bold": line.get("fontWeight") == "bold",
                "align": "center",
                "shadow": True,
            })

        # Componer imagen final
        final_bytes = compose_advertisement(
            product_image_bytes=nobg_bytes,
            background_image_bytes=bg_bytes,
            texts=texts,
            style_config=style_config,
            width=width,
            height=height,
        )

        # Guardar en disco
        ad_id = uuid.uuid4().hex
        ad_path = UPLOAD_DIR / f"{ad_id}.png"
        ad_path.write_bytes(final_bytes)

        generation_time = int((datetime.now() - start_time).total_seconds() * 1000)

        return JSONResponse({
            "id": ad_id,
            "image": base64.b64encode(final_bytes).decode(),
            "preview": f"/uploads/ads/{ad_id}.png",
            "metadata": {
                "format": request.format,
                "style": request.style,
                "dimensions": {"width": width, "height": height},
                "productName": request.productName,
                "price": request.price,
                "offer": request.offer,
                "generationTime": generation_time,
                "provider": "local",
                "model": "rembg + stable-diffusion",
            },
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando publicidad: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando publicidad: {str(e)}")


@app.get("/styles")
async def get_styles():
    """Retorna los estilos disponibles."""
    return [{"id": k, **v} for k, v in STYLES.items()]


@app.get("/formats")
async def get_formats():
    """Retorna los formatos disponibles."""
    return [{"id": k, **v} for k, v in FORMATS.items()]


@app.post("/cleanup")
async def cleanup():
    """Libera memoria de los modelos."""
    cleanup_models()
    return {"status": "ok", "message": "Modelos liberados"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)
