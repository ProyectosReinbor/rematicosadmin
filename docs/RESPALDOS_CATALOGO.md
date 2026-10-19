# Respaldos del catálogo

En **Admin → Productos → Respaldo del catálogo**:

1. **Exportar catálogo completo** descarga un archivo JSON con categorías (incluidas las inactivas), productos, tipos, tarjetas publicadas y ocultas, opciones, variantes, orden, identificadores, fechas y archivos de imagen incorporados. Guarda una copia fuera del servidor.
2. **Importar respaldo guardado** permite seleccionar ese archivo y revisar fecha y cantidades de registros. No cambia datos al seleccionar el archivo.
3. Marca la confirmación y pulsa **Restaurar catálogo** para reemplazar el catálogo por el estado respaldado. Exporta el estado actual antes si lo quieres conservar.

Se requiere sesión de administrador. La restauración valida el formato, las relaciones y la presencia de imágenes antes de modificar datos. Reemplaza las tablas del catálogo en una transacción; si falla, la base de datos conserva su estado anterior. Las imágenes recuperadas reciben nombres nuevos para evitar sobrescribir las existentes. Las imágenes antiguas permanecen en disco; este proceso no limpia archivos huérfanos.

El respaldo incluye imágenes subidas al catálogo (`/uploads/`), incluso si sus enlaces guardados contienen un dominio anterior. La exportación se detiene si falta un archivo o hay imágenes externas, en lugar de entregar un respaldo incompleto. Para imágenes externas, súbelas al admin antes de exportar. Límite del archivo: 500 MB (las imágenes incorporadas en base64 ocupan más que los originales).

## Recuperación y despliegue

El archivo respalda el catálogo, no usuarios, contraseñas, pagos, configuración del servidor ni el diseño de la página. Si se pierde toda la base de datos, primero hay que recrear una base compatible con el esquema Prisma vigente y una cuenta de administrador; después se importa el catálogo. Un catálogo vacío sobre una base inicializada sí puede restaurarse desde el admin.

Desplegar API, admin y la configuración Nginx actualizada. El endpoint `/api/catalog-backup/` necesita un límite de cuerpo de 500 MB y un tiempo de espera adecuado. Si hay otro proxy por delante de Nginx, configurar allí esos límites también. Estas modificaciones locales no actualizan por sí solas el servidor publicado.

Los respaldos incluyen únicamente el estado al momento de exportar. No se crean copias automáticas.
