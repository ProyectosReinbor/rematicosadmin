"""
Servicio de generación de imágenes usando Stable Diffusion local.
Soporta SDXL y SD 1.5 con optimizaciones de memoria.
"""
import io
import logging
import gc
from typing import Optional
from PIL import Image

logger = logging.getLogger(__name__)

# Modelos cargados en memoria (lazy loading)
_pipe_sdxl = None
_pipe_sd15 = None


def get_pipeline(model_type: str = "sdxl"):
    """
    Obtiene o crea el pipeline de Stable Diffusion.
    Modelos soportados: sdxl, sd15
    """
    global _pipe_sdxl, _pipe_sd15

    try:
        import torch
        from diffusers import StableDiffusionXLPipeline, StableDiffusionPipeline

        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32

        if model_type == "sdxl" and _pipe_sdxl is None:
            logger.info("Cargando modelo SDXL...")
            model_id = "stabilityai/stable-diffusion-xl-base-1.0"
            _pipe_sdxl = StableDiffusionXLPipeline.from_pretrained(
                model_id,
                torch_dtype=dtype,
                use_safetensors=True,
                variant="fp16" if device == "cuda" else None,
            )
            if device == "cuda":
                _pipe_sdxl = _pipe_sdxl.to(device)
                _pipe_sdxl.enable_attention_slicing()
                try:
                    _pipe_sdxl.enable_xformers_memory_efficient_attention()
                except Exception:
                    pass
            logger.info(f"SDXL cargado en {device}")

        elif model_type == "sd15" and _pipe_sd15 is None:
            logger.info("Cargando modelo SD 1.5...")
            model_id = "runwayml/stable-diffusion-v1-5"
            _pipe_sd15 = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=dtype,
                use_safetensors=True,
            )
            if device == "cuda":
                _pipe_sd15 = _pipe_sd15.to(device)
                _pipe_sd15.enable_attention_slicing()
            logger.info(f"SD 1.5 cargado en {device}")

        return _pipe_sdxl if model_type == "sdxl" else _pipe_sd15

    except ImportError as e:
        logger.error(f"Dependencias de diffusers no instaladas: {e}")
        raise
    except Exception as e:
        logger.error(f"Error cargando modelo: {e}")
        raise


def generate_background(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 30,
    guidance_scale: float = 7.5,
    model_type: str = "sdxl",
    seed: Optional[int] = None,
) -> bytes:
    """
    Genera una imagen de fondo usando Stable Diffusion.

    Args:
        prompt: Descripción del fondo a generar.
        negative_prompt: Qué evitar en la generación.
        width: Ancho de la imagen.
        height: Alto de la imagen.
        num_inference_steps: Pasos de inferencia (más = mejor calidad).
        guidance_scale: Escala de guía (CFG).
        model_type: Modelo a usar (sdxl o sd15).
        seed: Semilla para reproducibilidad.

    Returns:
        Bytes de la imagen generada (PNG).
    """
    try:
        import torch

        pipe = get_pipeline(model_type)

        if pipe is None:
            raise RuntimeError("Pipeline no disponible")

        # Configurar generador con seed
        generator = None
        if seed is not None:
            generator = torch.Generator(device=pipe.device).manual_seed(seed)

        # Generar imagen
        with torch.inference_mode():
            result = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=generator,
            )

        output_image = result.images[0]

        # Convertir a bytes
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", quality=100)
        output_buffer.seek(0)

        logger.info(f"Fondo generado: {width}x{height} con modelo {model_type}")
        return output_buffer.getvalue()

    except Exception as e:
        logger.error(f"Error generando fondo: {e}")
        raise


def generate_background_fast(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
) -> bytes:
    """
    Generación rápida con menos pasos y CFG.
    """
    return generate_background(
        prompt=prompt,
        negative_prompt="ugly, blurry, low quality, distorted, deformed",
        width=width,
        height=height,
        num_inference_steps=15,
        guidance_scale=5.0,
        model_type="sd15",
    )


def cleanup_models():
    """Libera memoria de los modelos cargados."""
    global _pipe_sdxl, _pipe_sd15

    if _pipe_sdxl is not None:
        del _pipe_sdxl
        _pipe_sdxl = None
    if _pipe_sd15 is not None:
        del _pipe_sd15
        _pipe_sd15 = None

    gc.collect()
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except ImportError:
        pass

    logger.info("Modelos liberados de memoria.")
