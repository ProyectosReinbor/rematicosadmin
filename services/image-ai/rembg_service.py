"""
Servicio de eliminación de fondo usando rembg (open source).
Utiliza el modelo U2-Net para segmentación de objetos.
"""
import io
import logging
from rembg import remove, new_session
from PIL import Image

logger = logging.getLogger(__name__)

# Sesión reutilizable para mejor rendimiento
_session = None


def get_session():
    """Obtiene o crea la sesión de rembg (lazy loading)."""
    global _session
    if _session is None:
        logger.info("Inicializando sesión de rembg con modelo u2net...")
        _session = new_session("u2net")
        logger.info("Sesión de rembg inicializada.")
    return _session


def remove_background(image_bytes: bytes, mime_type: str = "image/png") -> bytes:
    """
    Elimina el fondo de una imagen usando rembg.

    Args:
        image_bytes: Bytes de la imagen original.
        mime_type: Tipo MIME de la imagen de entrada.

    Returns:
        Bytes de la imagen sin fondo (PNG transparente).
    """
    try:
        session = get_session()

        # Abrir imagen desde bytes
        input_image = Image.open(io.BytesIO(image_bytes))

        # Convertir a RGBA para soporte de transparencia
        if input_image.mode != "RGBA":
            input_image = input_image.convert("RGBA")

        # Eliminar fondo
        output_image = remove(
            input_image,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )

        # Convertir a bytes PNG
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", quality=100)
        output_buffer.seek(0)

        logger.info(f"Fondo eliminado: {input_image.size} -> {output_image.size}")
        return output_buffer.getvalue()

    except Exception as e:
        logger.error(f"Error eliminando fondo: {e}")
        raise


def remove_background_simple(image_bytes: bytes) -> bytes:
    """
    Versión simple sin alpha matting (más rápida).
    """
    try:
        session = get_session()

        input_image = Image.open(io.BytesIO(image_bytes))
        if input_image.mode != "RGBA":
            input_image = input_image.convert("RGBA")

        output_image = remove(input_image, session=session)

        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", quality=100)
        output_buffer.seek(0)

        return output_buffer.getvalue()

    except Exception as e:
        logger.error(f"Error en remove_background_simple: {e}")
        raise
