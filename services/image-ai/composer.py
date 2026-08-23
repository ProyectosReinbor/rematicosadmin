"""
Servicio de composición de imágenes.
Mezcla producto sin fondo con fondo generado y agrega textos.
"""
import io
import logging
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

logger = logging.getLogger(__name__)

# Fuentes del sistema (fallback si no hay fuentes personalizadas)
SYSTEM_FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def find_font(bold: bool = True) -> str:
    """Encuentra una fuente disponible en el sistema."""
    import os
    for font_path in SYSTEM_FONTS:
        if os.path.exists(font_path):
            return font_path
    return ""


def compose_advertisement(
    product_image_bytes: bytes,
    background_image_bytes: bytes,
    texts: list[dict],
    style_config: dict,
    width: int = 1080,
    height: int = 1080,
    product_scale: float = 0.6,
    product_position: tuple = (0.5, 0.55),
) -> bytes:
    """
    Compone una imagen publicitaria final.

    Args:
        product_image_bytes: Imagen del producto sin fondo (PNG).
        background_image_bytes: Fondo generado.
        texts: Lista de textos con formato [{text, x, y, size, color, bold}]
        style_config: Configuración de estilo {primary, secondary, accent, background, text}
        width: Ancho final.
        height: Alto final.
        product_scale: Escala del producto (0-1).
        product_position: Posición del producto (0-1, 0-1).

    Returns:
        Bytes de la imagen compuesta (PNG).
    """
    try:
        # Crear canvas final
        canvas = Image.new("RGBA", (width, height), (255, 255, 255, 255))

        # Cargar y escalar fondo
        bg = Image.open(io.BytesIO(background_image_bytes))
        bg = bg.convert("RGBA")
        bg = bg.resize((width, height), Image.Resampling.LANCZOS)

        # Aplicar leve blur al fondo para dar profundidad
        bg = bg.filter(ImageFilter.GaussianBlur(radius=2))

        # Ajustar brillo del fondo
        enhancer = ImageEnhance.Brightness(bg)
        bg = enhancer.enhance(0.85)

        canvas.paste(bg, (0, 0), bg)

        # Cargar y escalar producto
        product = Image.open(io.BytesIO(product_image_bytes))
        product = product.convert("RGBA")

        # Calcular tamaño del producto
        product_max_w = int(width * product_scale)
        product_max_h = int(height * product_scale)
        product.thumbnail((product_max_w, product_max_h), Image.Resampling.LANCZOS)

        # Posicionar producto
        px = int(width * product_position[0] - product.width / 2)
        py = int(height * product_position[1] - product.height / 2)

        # Agregar sombra al producto
        shadow = Image.new("RGBA", product.size, (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.ellipse(
            [10, product.height - 20, product.width - 10, product.height],
            fill=(0, 0, 0, 60),
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
        canvas.paste(shadow, (px, py + 10), shadow)

        # Pegar producto
        canvas.paste(product, (px, py), product)

        # Dibujar textos
        draw = ImageDraw.Draw(canvas)
        font_path = find_font(bold=True)
        font_path_regular = find_font(bold=False)

        for text_config in texts:
            text = text_config.get("text", "")
            tx = int(width * text_config.get("x", 0.5))
            ty = int(height * text_config.get("y", 0.1))
            size = text_config.get("size", 48)
            color = text_config.get("color", "#FFFFFF")
            bold = text_config.get("bold", True)
            align = text_config.get("align", "center")
            shadow_enabled = text_config.get("shadow", True)

            # Seleccionar fuente
            use_font = font_path if bold else font_path_regular
            if use_font:
                try:
                    font = ImageFont.truetype(use_font, size)
                except Exception:
                    font = ImageFont.load_default()
            else:
                font = ImageFont.load_default()

            # Calcular bounding box del texto
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            # Ajustar posición según alineación
            if align == "center":
                tx = tx - text_width // 2
            elif align == "right":
                tx = tx - text_width

            # Sombra del texto
            if shadow_enabled:
                shadow_color = (0, 0, 0, 180)
                for offset in [(2, 2), (3, 3)]:
                    draw.text(
                        (tx + offset[0], ty + offset[1]),
                        text,
                        font=font,
                        fill=shadow_color,
                        stroke_width=1,
                    )

            # Texto principal
            draw.text(
                (tx, ty),
                text,
                font=font,
                fill=color,
                stroke_width=0,
            )

        # Convertir a bytes
        output_buffer = io.BytesIO()
        canvas.convert("RGB").save(output_buffer, format="PNG", quality=100)
        output_buffer.seek(0)

        logger.info(f"Publicidad compuesta: {width}x{height}, {len(texts)} textos")
        return output_buffer.getvalue()

    except Exception as e:
        logger.error(f"Error componiendo imagen: {e}")
        raise


def apply_text_overlay(
    image_bytes: bytes,
    texts: list[dict],
    width: int = 1080,
    height: int = 1080,
) -> bytes:
    """
    Aplica solo texto sobre una imagen existente.
    Útil cuando el fondo ya incluye el producto.
    """
    try:
        canvas = Image.open(io.BytesIO(image_bytes))
        canvas = canvas.convert("RGBA")
        canvas = canvas.resize((width, height), Image.Resampling.LANCZOS)

        draw = ImageDraw.Draw(canvas)
        font_path = find_font(bold=True)

        for text_config in texts:
            text = text_config.get("text", "")
            tx = int(width * text_config.get("x", 0.5))
            ty = int(height * text_config.get("y", 0.1))
            size = text_config.get("size", 48)
            color = text_config.get("color", "#FFFFFF")
            bold = text_config.get("bold", True)

            if font_path:
                try:
                    font = ImageFont.truetype(font_path, size)
                except Exception:
                    font = ImageFont.load_default()
            else:
                font = ImageFont.load_default()

            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            tx = tx - text_width // 2

            # Sombra
            for offset in [(2, 2), (3, 3)]:
                draw.text(
                    (tx + offset[0], ty + offset[1]),
                    text,
                    font=font,
                    fill=(0, 0, 0, 180),
                )

            draw.text((tx, ty), text, font=font, fill=color)

        output_buffer = io.BytesIO()
        canvas.convert("RGB").save(output_buffer, format="PNG", quality=100)
        output_buffer.seek(0)

        return output_buffer.getvalue()

    except Exception as e:
        logger.error(f"Error aplicando texto: {e}")
        raise
