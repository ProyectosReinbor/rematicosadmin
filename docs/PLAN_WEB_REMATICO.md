# Plan detallado — Web de Rematico Villavicencio

Fecha: 1 de octubre de 2026.

## Objetivo y referencia

Crear una web de insumos de confección, tejido y decoración que permita explorar productos sin precios, elegir cantidades y consultar disponibilidad por WhatsApp.

[Mega Import](https://www.megaimport.co/) sirve de referencia para su navegación por familias y tipos. Su catálogo muestra, por ejemplo, Confección → Cinta → Agua, Doble Razo, Floral, Fusionable y Satinada. La adaptación usa contenido, fotografías y marca de Rematico; no importa fotografías ni inventario del proveedor y no implementa pagos o precios.

## Modelo comercial acordado

```text
Categoría: Confección (principal, no eliminable)
  Producto: Cintas
    Tipo: Agua
      Tarjeta: Cinta de agua roja 10 mm
        Imagen: fotografía propia
        Venta: rollo
        Cantidad consultada: 3
    Tipo: Doble razo
      Tarjeta: Cinta doble razo blanca 20 mm
        Venta: paquete de 12 unidades
        Cantidad consultada: 2 paquetes
```

“Producto” identifica una familia, como Cintas. “Tipo” distingue Agua de Doble razo. “Tarjeta” identifica el artículo que el cliente elige y consulta. Una tarjeta pertenece a un único tipo; el tipo pertenece a un único producto; el producto pertenece a una categoría.

Las categorías principales tienen identificadores estables aunque se edite su nombre. Las adicionales pueden eliminarse si están vacías. No habrá eliminación automática de todos los descendientes al borrar una categoría, producto o tipo: primero se deben mover o eliminar sus elementos explícitamente.

La presentación es un texto editable, con sugerencias: unidad, kilogramo, docena, rollo, metro, caja, par y paquete de N unidades. Así se admiten presentaciones nuevas sin cambiar el código. Si más adelante se necesitan reglas particulares por presentación, se puede evolucionar a una tabla de presentaciones sin añadir precios.

## Dirección visual

| Uso                                 | Color aproximado tomado del aviso |
| ----------------------------------- | --------------------------------- |
| Marca, botones principales, portada | Rojo `#BC1736`                    |
| Texto destacado, apoyos y llamadas  | Amarillo `#FFE482`                |
| WhatsApp y atención                 | Verde oscuro                      |
| Lectura y tarjetas                  | Blanco y gris oscuro              |

Mantener buen contraste, fotografías sobre fondo limpio y botones grandes en celular. La imagen disponible contiene el aviso completo; para un resultado final más nítido conviene obtener el logo original o preparar posteriormente un recorte/vector autorizado.

La composición propuesta: encabezado con marca y navegación, portada comercial, seis categorías, catálogo con filtros, ficha de artículo, lista de consulta y pie con información real del negocio. Las ilustraciones actuales son apoyos de interfaz; la etapa de contenido sustituirá los espacios comerciales por fotografías propias.

## Fases y criterios de aceptación

### 1. Diagnóstico y conservación — realizada localmente

- Identificar tienda, admin, API, almacenamiento y dependencias.
- Contrastar README con rutas y pantallas existentes.
- Revisar el logo y la estructura del sitio de referencia.
- Detectar duplicados de categoría y modelo de tipos anterior.
- Identificar diferencias entre esquema y migraciones.

Aceptación: diagnóstico trazable en `ESTADO_PROYECTO.md`, sin asumir que la configuración de producción está funcionando.

### 2. Jerarquía y reglas — implementada

- Crear tablas de familias de productos y tipos.
- Relacionar las tarjetas con tipos y validar que pertenecen a la categoría indicada.
- Mantener nullable la relación para que las tarjetas antiguas puedan clasificarse sin borrarlas.
- Proteger las seis categorías principales en el servidor.
- Impedir eliminación de padres con hijos y devolver mensajes claros.
- Corregir el slug antiguo de Confección y conservar el registro antiguo cuando exista duplicado.

Aceptación: un administrador puede crear Confección → Cintas → Agua y agregar tarjetas; el API rechaza relaciones cruzadas y eliminación de categorías protegidas.

### 3. Administrador comercial — implementada

- Paneles de categorías, productos y tipos, con selección progresiva.
- Crear, editar y eliminar nombres en cada nivel.
- Crear/editar/eliminar tarjetas, con nombre, imagen, presentación y Guardar.
- Publicar, dejar en borrador, ocultar o archivar tarjetas.
- Permitir texto libre para nuevas presentaciones.
- Mostrar tarjetas antiguas pendientes de clasificar.
- Conservar datos e imágenes existentes durante edición y mantener rutas de tarjetas estables.

Aceptación: una tarjeta guardada como publicada aparece en el catálogo con su imagen y presentación; una tarjeta borrador no aparece. Ningún formulario exige precio.

### 4. Web pública e identidad — base implementada

- Portada con el aviso disponible, colores de marca y propuesta comercial.
- Accesos a las seis categorías y catálogo con buscador/paginación.
- Navegación por producto y tipo, conservada en la URL para enlaces compartibles.
- Tarjetas con imagen, nombre, categoría/tipo y forma de venta.
- Pantallas de carga, error recuperable y sin resultados.
- Diseño adaptable a escritorio y celular.

Aceptación: se puede entrar a Confección, elegir Cintas y Agua, identificar una tarjeta y abrir su consulta sin ver precios.

Pendiente editorial: fotografía principal profesional, imágenes propias de categorías, secciones de productos destacados con inventario real y nombres finales revisados por el negocio.

### 5. Cantidades y WhatsApp — implementada

- Elegir cantidad desde el catálogo al abrir la tarjeta de consulta.
- Consulta individual por WhatsApp y lista de varios artículos.
- Editar cantidades y eliminar artículos de la lista.
- Mostrar “paquete de 24 unidades” completo, sin convertirlo en “unidad”.
- Permitir fracciones en metros/kilos y enteros en paquetes/docenas/rollos.
- Mantener la lista en este navegador y combinar selecciones iguales.
- Incluir artículo, producto/tipo, cantidad y presentación en el mensaje.

Ejemplo de consulta: “Hola Rematico Villavicencio, ¿tienen disponible Cinta de agua roja 10 mm? Producto: Cintas; Tipo: Agua. Necesito 3 rollos”. El mensaje consulta disponibilidad; no confirma stock, reserva, pedido ni pago.

Aceptación: cambiar de 1 a 3 modifica el mensaje; una presentación de paquete conserva su contenido; abrir WhatsApp no envía automáticamente el mensaje.

### 6. Contenido real y operación — pendiente del negocio

1. Preparar una lista de productos por cada una de las seis categorías.
2. Crear sus tipos, empezando por las familias con mayor demanda.
3. Fotografiar cada artículo con buena luz y fondo consistente.
4. Registrar una tarjeta por artículo/presentación que deba consultarse por separado.
5. Revisar nombres, ortografía, colores, medidas y contenido de paquetes.
6. Confirmar dirección, horario, redes oficiales y número de contacto. El teléfono del aviso y del proyecto coincide, pero falta confirmar la información operativa.
7. Clasificar cualquier tarjeta antigua; ocultar borradores y material de prueba.
8. Ensayar consultas desde celular y definir quién responde y cómo confirma existencias.

Aceptación: cada categoría tiene contenido comercial revisado; no se publican datos, antigüedad, dirección, stock o fotografías inventados.

### 7. Calidad y preparación de despliegue — parte comprobada, parte pendiente

Comprobado localmente: revisión TypeScript, compilaciones, pruebas automatizadas de jerarquía, pruebas anteriores y recorrido de escritura/lectura con PostgreSQL. Se corrigió la elevación de permisos por registro público.

Antes de producción:

- Revisar reglas de todas las rutas heredadas de imágenes, atributos, pagos y publicidad. La corrección del registro no sustituye una auditoría completa.
- Fortalecer validación de archivos por contenido y definir almacenamiento/respaldo de imágenes.
- Verificar teclado, foco del modal, lector de pantalla y comportamiento móvil con artículos reales.
- Unificar gestor de paquetes, corregir comandos de lint y modernizar la configuración de Next.
- Optimizar fotos (tamaños derivados, carga diferida) y medir rendimiento con contenido real.
- Agregar metadatos por artículo, sitemap, robots y datos estructurados del negocio cuando se confirme dirección/horarios. No incluir ofertas con precios inexistentes.
- Definir consentimiento/privacidad para cualquier analítica; no agregar seguimiento sin acordarlo.

Aceptación: compilaciones reproducibles y pruebas funcionales completas sin errores; carga y consultas correctas en Android/iPhone y escritorio.

### 8. Publicación — pendiente; no ejecutada

1. Respaldar PostgreSQL y el volumen de imágenes, y probar restauración.
2. Comparar el esquema del servidor con el schema Prisma; decidir y documentar un baseline correcto. La base local usaba `db push`; las migraciones históricas están incompletas.
3. Preparar una migración revisada para el servidor, probarla en una copia de los datos y conservar un procedimiento de reversión.
4. Construir API, admin y tienda; verificar volúmenes, rutas de imágenes y variables de entorno.
5. Corregir el destino del WebSocket si se conservan pagos/eventos; verificar certificados y renovación.
6. Publicar primero en un entorno de revisión, probar login, CRUD, catálogo y WhatsApp.
7. Aprobar el contenido final y publicar en el dominio acordado.
8. Vigilar errores y respaldos; documentar mantenimiento y carga de nuevos artículos.

Aceptación: navegación HTTPS, administrador protegido, datos conservados, imágenes persistentes tras reinicio y consulta WhatsApp funcional. No considerar finalizada esta fase solo porque `next build` termine.

## Orden recomendado para continuar

La base funcional de las fases 1–5 está en el proyecto. El siguiente trabajo debe ser cargar y revisar contenido real (fase 6), cerrar la preparación de producción (fase 7) y validar/publicar (fase 8). Las mejoras de banners, destacados, SEO y navegación más elaborada deben construirse sobre un catálogo real, manteniendo el flujo sin precios.

## Uso del administrador

1. Entrar a `/login` con la cuenta administradora existente.
2. Seleccionar una categoría; usar Crear en Productos para registrar, por ejemplo, Cintas.
3. Seleccionar Cintas; usar Crear en Tipos para registrar Agua, Doble razo u otro.
4. Seleccionar el tipo y pulsar Agregar tarjeta.
5. Subir imagen, escribir nombre y presentación; guardar como Publicado o Borrador.
6. Usar Editar para cambiar la tarjeta o elegir otro destino. Para eliminar un producto/tipo, primero mover o retirar sus tarjetas y tipos contenidos.
7. Abrir el catálogo, elegir cantidad y probar el enlace de WhatsApp sin enviar mensajes de prueba a clientes.

Vista previa preparada para revisión: tienda en `http://localhost:3101` y administrador en `http://localhost:3100/login`, mientras los procesos locales permanezcan activos. Puertos normales del proyecto: tienda 3001, admin 3000 y API 4000.
