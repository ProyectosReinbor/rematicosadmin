# Estado del proyecto — Rematico Villavicencio

Revisión realizada el 1 de octubre de 2026. Este documento distingue lo observado en el código, lo comprobado localmente y lo pendiente de verificar en producción.

## Resultado de la revisión

El proyecto es una base funcional para un catálogo de consulta por WhatsApp, pero el README describe una plataforma más amplia que la interfaz disponible. No estaba organizado con la jerarquía comercial solicitada. La versión de trabajo incorpora ahora categoría → producto → tipo → tarjetas, conserva compatibilidad con las tarjetas antiguas y utiliza la identidad del negocio.

No se verificó ni se publicó el servidor de producción. La información de dominio y contenedores es configuración del repositorio, no evidencia de que esos servicios estén funcionando públicamente.

## Arquitectura real

| Parte             | Tecnología y función                                                   | Observación                                                                                                  |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/storefront` | Next.js 15, React 19, TypeScript, Tailwind 4; tienda en el puerto 3001 | Es la web pública principal. La raíz antes redirigía al catálogo.                                            |
| `apps/web`        | Next.js; administrador en el puerto 3000                               | La navegación real del admin solo exponía Productos; clientes y configuración tienen páginas mínimas.        |
| `apps/api`        | Express, Prisma 5, PostgreSQL; puerto 4000                             | Gestiona autenticación, catálogo, imágenes y módulos anteriores de pagos/publicidad.                         |
| `packages`        | Código compartido y eventos                                            | Hay paquetes pequeños y carpetas sin un workspace independiente; no asumir que todos son módulos terminados. |
| `infra`           | Docker, Nginx, certificados y volúmenes                                | Existe infraestructura de despliegue, pendiente de probar de extremo a extremo.                              |
| `services`        | Servicios complementarios                                              | La eliminación de fondos depende de un servicio externo al API principal.                                    |

Los frontends reenvían `/api/*` y `/uploads/*` al backend. Las imágenes del catálogo son archivos servidos por la API; PostgreSQL conserva sus rutas y metadatos, no los archivos.

## Hallazgos anteriores a los cambios

1. **Jerarquía insuficiente.** Category se relacionaba directamente con Product. Los tipos se almacenaban como valores del atributo “Tipo”. No había una entidad independiente para Cintas, sus tipos y las tarjetas dentro de cada tipo.
2. **Categorías incorrectas.** El código definía ocho categorías base, incluyendo Alfileres y Accesorios y Herramientas. Había un slug `confaccion` además de `confeccion` en la base consultada inicialmente. La clasificación principal/adicional dependía de tener un icono.
3. **Eliminación de categorías ausente.** El API y el admin permitían crearlas y renombrarlas, pero no eliminarlas ni proteger explícitamente las seis solicitadas.
4. **Catálogo de consulta parcialmente listo.** Ya existían buscador, paginación, imágenes, opciones, ficha de producto, lista persistida y consulta colectiva por WhatsApp. No había precios en Product.
5. **Presentación comercial incompleta.** El catálogo reconocía unidades fijas; algunas etiquetas perdían el contenido de los paquetes. La cantidad en el modal se convertía a entero.
6. **Marca incompleta.** La interfaz utilizaba rosa, emojis y un nombre genérico. `imagenes/logo.jpeg` es una fotografía horizontal del aviso, no un logo vectorial recortado. Predominan rojo, amarillo y verde. El número visible, 3113487967, coincide con el WhatsApp del código.
7. **Vulnerabilidad en el registro público.** El endpoint de registro aceptaba `role: ADMIN` del cuerpo enviado por cualquier visitante. Fue corregido: el registro público ahora crea exclusivamente USER; los administradores existentes conservan su rol.
8. **Sesiones inconsistentes.** El backend respondía 403 a tokens expirados, pero el cliente solo renovaba ante 401. La expiración dejaba cookies y almacenamiento desalineados. Se corrigió el estado HTTP y la limpieza/renovación de la cookie de acceso. El layout del admin ahora comprueba sesión y rol antes de mostrar el catálogo.
9. **Errores asíncronos.** Las rutas de productos usaban handlers async directamente en Express 4. Ahora canalizan sus errores al manejador central. Los errores de duplicado, elemento inexistente y relaciones se traducen a respuestas comprensibles.
10. **Documentación desactualizada.** El README anuncia dashboard y pantallas de pagos que no están en la navegación actual. BancolombiaProvider declara métodos no implementados. Configuración y clientes no son módulos terminados.
11. **Migraciones incompletas.** La base local estaba creada sin registrar migraciones aplicadas. Las migraciones históricas no reproducen todo el esquema actual: faltan, entre otros, modelos de autenticación/verificación y la unidad de venta del catálogo. No se deben marcar migraciones como aplicadas ni ejecutarlas a ciegas en una base con datos.
12. **Herramientas de desarrollo.** Coexisten package-lock en la raíz y pnpm-lock en web; generan advertencias. Había un conflicto de configuración ESLint entre web y la raíz; se añadió `root: true` al admin. Los scripts `next lint` requieren revisión con la versión instalada.
13. **Despliegue.** Nginx referencia el WebSocket en 4001, mientras `src/index.ts` lo conecta al servidor HTTP de la API. Los certificados y la renovación necesitan una prueba operacional. Esto no bloquea la consulta por WhatsApp, pero impide considerar validada toda la infraestructura.

La primera lectura local encontró doce categorías y una tarjeta. Estos conteos son instantáneas del entorno compartido, no inventario comercial certificado. No se importaron productos ni fotografías del sitio de referencia.

## Cambios implementados

- Seis categorías principales: Confección, Agujas, Hilos, Decoración, Lanas y Tijeras. Protección de eliminación por slug estable en el API; pueden renombrarse.
- Nuevas entidades `CatalogGroup` y `CatalogType`, con relación opcional `Product.typeId` para las tarjetas. Internamente Product conserva su nombre histórico para evitar una conversión destructiva.
- Administrador con tres paneles: categorías, productos y tipos. Crear, renombrar y eliminar elementos; eliminación de niveles superiores bloqueada si contienen datos.
- Formulario de tarjeta con nombre, imagen, presentación de venta editable, visibilidad y Guardar. No contiene precios. Las descripciones antiguas se conservan al editar.
- Reemplazo atómico de los registros de imágenes al editar una tarjeta. Los archivos anteriores no se eliminan físicamente, para evitar pérdida de recursos compartidos; su limpieza será un proceso posterior.
- Portada, logo, paleta del negocio, seis accesos al catálogo y explicación del proceso de consulta.
- Filtros categoría → producto → tipo y etiquetas de presentación en las tarjetas públicas.
- Consulta individual desde el modal y consulta colectiva desde Mi lista. El mensaje incluye producto, tipo, presentación y cantidad; el usuario confirma el envío en WhatsApp.
- Cantidades enteras para unidades/paquetes/docenas/rollos y decimales de una cifra para metros/kilos. La lista permite edición directa de cantidad y combina selecciones iguales.
- Migración aditiva y sincronización de categorías que conserva la compatibilidad con registros antiguos. Cuando existen las dos Confecciones, las tarjetas y grupos de la antigua se trasladan a la canónica y el registro antiguo se oculta, sin borrarlo.

## Validación y límites

Se generó el cliente Prisma y se sincronizó el esquema de la base local mediante `db push`, sin aceptar pérdida de datos. El motor de Prisma encontró un archivo bloqueado durante una regeneración posterior; el cliente previamente generado permitió completar las pruebas de integración.

Pasaron las 55 pruebas anteriores más las pruebas añadidas para categorías y jerarquía. Se añadió también una prueba de registro sin elevación de permisos. Revisar el resultado final de la ejecución en la entrega.

Se comprobó con PostgreSQL: crear categoría, producto, tipo y tarjeta, editar la tarjeta, filtrar por tipo, excluir borradores del catálogo público, bloquear eliminación de tipos con tarjetas y proteger una categoría principal. Los registros temporales creados por esa prueba fueron retirados.

La tienda y el admin produjeron compilaciones. La primera compilación del admin señaló el conflicto ESLint anterior; se corrigió su configuración. Se observan avisos de optimización de imágenes y configuración `experimental.turbo` antigua. No equivalen a una auditoría de rendimiento ni de seguridad completa.

Para revisar la interfaz se prepararon puertos 3101 (tienda) y 3100 (admin) con salida `.next-preview`, separada de las compilaciones normales. No se debe compilar y ejecutar desarrollo simultáneamente sobre la misma carpeta `.next`.

Pendiente para una publicación comercial: fotografías reales, carga/clasificación del catálogo, dirección y horarios confirmados, política de privacidad, auditoría completa de rutas heredadas, respaldo y migraciones de producción, pruebas de HTTPS y restauración.
