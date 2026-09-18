Tomando como base el archivo de desarrollo del proyecto y lo que acabas de definir, la **Fase 1 no debe implementar todavía el rediseño completo**. Primero debe dejar una base sólida para que el catálogo soporte ~5.000 productos y el administrador pueda gestionarlos rápidamente.

El siguiente prompt es el que le daría a OpenCode.

# FASE 1 — ARQUITECTURA UX/UI Y BASE DEL CATÁLOGO

Lee primero `desarrollo.md` completo y analiza la arquitectura actual del proyecto antes de modificar cualquier archivo.

El proyecto es Adornos Remático. Actualmente existe un monorepo con:

* `apps/api` → Express + TypeScript
* `apps/web` → storefront público
* `apps/admin` → panel administrativo
* PostgreSQL + Prisma
* Redis
* autenticación
* Docker/Nginx
* API REST

NO rehagas la arquitectura existente.

NO elimines funcionalidades existentes.

NO cambies contratos de API, autenticación, modelos ni lógica de negocio sin necesidad.

============================================================
OBJETIVO DE ESTA FASE
=====================

Preparar la arquitectura de UX/UI y el modelo funcional necesario para construir posteriormente un catálogo profesional, rápido, escalable y extremadamente fácil de utilizar.

El objetivo final del proyecto es que Adornos Remático tenga una experiencia visual de nivel profesional, pero esta fase debe concentrarse en establecer correctamente la base.

El catálogo deberá poder manejar aproximadamente 5.000 productos sin convertirse en una interfaz lenta o difícil de utilizar.

============================================================
PRODUCTOS
=========

Cada producto debe poder tener:

* Nombre.
* Descripción.
* Categoría.
* Estado publicado/despublicado.
* Unidad o modalidad de venta.
* Imágenes.
* Orden de imágenes.
* Atributos.
* Valores de atributos.
* Fecha de creación.
* Fecha de actualización.

No implementar precios.

No implementar inventario POS.

No crear complejidad innecesaria.

============================================================
UNIDAD DE VENTA
===============

El producto debe poder indicar cómo se vende.

Ejemplos:

* Unidad.
* Docena.
* Libra.
* Kilogramo.
* Paquete.
* Paquete de 50.
* Paquete de 100.
* Paquete de 1000.
* Paquete de 10000.

La solución debe permitir que posteriormente puedan agregarse otras modalidades sin modificar la arquitectura completa.

No asumir que solamente existirán las opciones anteriores.

La unidad de venta debe ser información del producto y mostrarse correctamente en el storefront.

============================================================
ATRIBUTOS
=========

Simplificar completamente el sistema de atributos.

Un producto puede tener atributos como:

Color
Tamaño
Material
Forma
Acabado
etc.

Cada atributo tiene valores.

Ejemplo:

Color:

* Rojo
* Azul
* Dorado
* Verde

Tamaño:

* Pequeño
* Mediano
* Grande

IMPORTANTE:

NO utilizar imágenes asociadas a atributos.

NO crear imágenes por valor de atributo.

NO crear variantes complejas innecesarias.

El sistema debe ser:

Producto
→ Atributo
→ Valores

Debe ser extremadamente sencillo para el empleado.

============================================================
IMÁGENES
========

Cada producto tendrá una galería de imágenes.

Debe existir:

* Imagen principal.
* Imágenes secundarias.
* Orden configurable.
* Subida de múltiples imágenes.
* Eliminación.
* Reordenamiento.

La galería será independiente de los atributos.

NO asociar imágenes con colores, tamaños u otros valores.

El objetivo es mantener el sistema simple.

============================================================
PUBLICACIÓN
===========

Cada producto debe poder estar:

* Publicado.
* Despublicado.

Un producto despublicado:

* permanece en administración;
* puede editarse;
* no debe aparecer en el catálogo público.

No eliminar productos simplemente para ocultarlos.

La publicación debe ser una acción clara y reversible.

============================================================
CATEGORÍAS
==========

Los productos deben pertenecer a categorías.

El catálogo debe poder:

* Mostrar productos por categoría.
* Filtrar por categoría.
* Permitir administrar categorías.
* Mantener una estructura preparada para muchas categorías.

No crear una jerarquía excesivamente compleja si el sistema actual no la necesita.

============================================================
CATÁLOGO PÚBLICO
================

Diseñar la arquitectura pensando en aproximadamente 5.000 productos.

El usuario debe poder:

* Ver productos.
* Buscar por nombre.
* Filtrar por categoría.
* Abrir un producto.
* Navegar rápidamente.
* Volver al catálogo.
* Utilizarlo cómodamente desde celular vertical.
* Utilizarlo cómodamente desde computador horizontal.

La interfaz NO debe intentar cargar 5.000 productos completos simultáneamente.

Preparar una estrategia adecuada de:

* paginación;
* búsqueda;
* filtros;
* carga eficiente;
* imágenes optimizadas;
* estados de carga;
* estados vacíos.

La solución debe poder crecer posteriormente a más productos.

============================================================
RESPONSIVE
==========

El diseño debe funcionar correctamente desde el inicio en:

* teléfonos pequeños;
* teléfonos grandes;
* tablets;
* laptops;
* computadores de escritorio;
* pantallas grandes.

Prioridad:

Móvil vertical primero.

Después escritorio horizontal.

REGLA:

Nada puede quedar fuera de la pantalla accidentalmente.

No debe existir:

* overflow horizontal innecesario;
* botones cortados;
* textos imposibles de leer;
* formularios que excedan el ancho;
* imágenes deformadas;
* tablas imposibles de utilizar en móvil.

Los botones deben tener tamaños cómodos para interacción táctil.

El texto debe ser claramente legible.

============================================================
DIRECCIÓN VISUAL
================

La dirección visual futura debe buscar una experiencia de nivel premium.

Adornos Remático debe sentirse como una marca moderna de productos creativos.

Principios:

* Mucho espacio visual.
* Fotografía protagonista.
* Jerarquía clara.
* Tipografía limpia.
* Bordes redondeados.
* Sombras sutiles.
* Animaciones suaves.
* Microinteracciones.
* Excelente responsive.
* Pocos elementos innecesarios.
* Nada debe sentirse como un CRUD tradicional.

La interfaz debe ser agradable pero también extremadamente funcional.

No sacrificar velocidad por efectos visuales.

============================================================
SISTEMA DE DISEÑO
=================

Analiza los estilos actuales y prepara una base reutilizable para:

* colores;
* tipografía;
* espaciado;
* tamaños;
* radios;
* sombras;
* botones;
* inputs;
* selects;
* cards;
* badges;
* modales;
* loaders;
* estados vacíos;
* mensajes de error;
* transiciones.

Evita estilos inconsistentes repetidos por toda la aplicación.

Prioriza componentes reutilizables.

NO hagas todavía un rediseño visual completo de todas las páginas.

Primero establece la base.

============================================================
ADMINISTRACIÓN
==============

El administrador debe estar preparado para gestionar muchos productos.

La futura experiencia deberá permitir:

* crear producto;
* editar producto;
* publicar;
* despublicar;
* buscar;
* filtrar;
* ordenar;
* categorizar;
* subir imágenes;
* ordenar imágenes;
* crear atributos;
* agregar valores de atributos.

La interfaz debe estar diseñada para empleados que no necesitan conocer programación.

La información técnica debe permanecer oculta.

El usuario administrativo debe entender qué hacer sin leer documentación.

============================================================
REGLAS CRÍTICAS DE PRESERVACIÓN
===============================

Antes de modificar:

1. Inspecciona el código existente.
2. Inspecciona `schema.prisma`.
3. Inspecciona las rutas API relacionadas con productos.
4. Inspecciona los servicios existentes.
5. Inspecciona las páginas actuales del storefront.
6. Inspecciona las páginas actuales del admin.
7. Identifica qué funcionalidades ya existen.

NO supongas que una funcionalidad no existe solamente porque no sea visible en una página.

NO elimines código funcional para reemplazarlo por una implementación nueva.

NO hagas una reescritura completa.

Si existe una implementación compatible, reutilízala.

Si el modelo actual no soporta exactamente algún requisito, documenta primero la diferencia y realiza solamente el cambio mínimo necesario.

============================================================
RENDIMIENTO
===========

El diseño debe estar preparado para 5.000 productos.

Analiza especialmente:

* consultas de productos;
* índices de PostgreSQL;
* búsqueda por nombre;
* filtros por categoría;
* paginación;
* ordenamiento;
* cantidad de datos enviados por API;
* imágenes;
* caché;
* renderizado del frontend.

No optimices prematuramente modificando arquitectura sin necesidad.

Primero identifica los cuellos de botella reales.

============================================================
LO QUE NO DEBES HACER EN ESTA FASE
==================================

NO:

* eliminar funcionalidades;
* eliminar rutas;
* eliminar endpoints;
* eliminar campos existentes sin justificación;
* eliminar autenticación;
* cambiar el sistema de permisos;
* cambiar la arquitectura del monorepo;
* implementar precios;
* implementar inventario POS;
* crear variantes complejas;
* asociar imágenes a atributos;
* crear una interfaz gigantesca;
* rehacer todo el proyecto desde cero.

============================================================
PROCESO OBLIGATORIO
===================

FASE A — AUDITORÍA

Analiza primero el proyecto completo.

FASE B — PLAN

Determina qué partes existentes pueden reutilizarse.

FASE C — CAMBIOS MÍNIMOS

Implementa únicamente la infraestructura necesaria para esta fase.

FASE D — VALIDACIÓN

Ejecuta:

* typecheck;
* lint;
* tests existentes;
* build del proyecto.

Si existen pruebas relacionadas con productos, catálogo, autenticación o API, ejecútalas.

Corrige los errores introducidos por tus cambios.

============================================================
DOCUMENTACIÓN FINAL
===================

Al terminar entrega:

1. Resumen de la arquitectura encontrada.
2. Funcionalidades existentes identificadas.
3. Cambios realizados.
4. Archivos modificados.
5. Modelo actual de productos.
6. Cómo se representan las unidades de venta.
7. Cómo se representan atributos y valores.
8. Cómo funciona publicación/despublicación.
9. Estrategia prevista para aproximadamente 5.000 productos.
10. Estrategia responsive.
11. Pruebas ejecutadas.
12. Resultado del build.
13. Problemas encontrados.
14. Problemas pendientes.

IMPORTANTE:

Esta es únicamente la FASE 1.

No continúes automáticamente con el rediseño completo del storefront, página de producto o Product Builder.

Primero deja la base preparada, estable y verificada para las siguientes fases.

La prioridad absoluta es:

FUNCIONALIDAD EXISTENTE
→ ESTABILIDAD
→ ESCALABILIDAD
→ UX
→ UI
→ ANIMACIONES

Este prompt cambia un punto importante respecto al plan anterior: **las imágenes dejan de depender de los atributos**. El modelo que buscas queda mucho más limpio:

```text
PRODUCTO
├── Nombre
├── Descripción
├── Categoría
├── Unidad de venta
├── Estado
├── Galería
│   ├── Imagen principal
│   ├── Imagen 2
│   └── Imagen 3
└── Atributos
    ├── Color
    │   ├── Rojo
    │   ├── Azul
    │   └── Dorado
    └── Tamaño
        ├── Pequeño
        ├── Mediano
        └── Grande
```

Esto es especialmente importante para **5.000 productos**: no necesitas crear una estructura de variantes e imágenes asociadas que complique innecesariamente la administración.

La **Fase 2** debería ser entonces el **Design System completo**, y después construiríamos encima el catálogo de 5.000 productos y el Product Builder.

La siguiente fase debe ser el **Design System**, porque todo el storefront y el admin deben construirse después sobre una misma base visual. No conviene empezar todavía a rediseñar páginas individuales.

# FASE 2 — DESIGN SYSTEM PROFESIONAL

Lee primero `desarrollo.md` y revisa los cambios realizados en la Fase 1.

No asumas cómo quedó implementada la Fase 1: inspecciona el código real.

El objetivo de esta fase es construir el sistema visual base de Adornos Remático sobre el cual posteriormente se rediseñarán el catálogo, productos y administración.

============================================================
OBJETIVO
========

Crear una identidad visual moderna, premium, limpia y extremadamente usable.

Adornos Remático debe sentirse como una plataforma profesional de productos creativos, no como un CRUD ni como una plantilla administrativa genérica.

La interfaz debe transmitir:

* calidad;
* orden;
* confianza;
* creatividad;
* facilidad de uso;
* modernidad.

La estética debe ser elegante sin sacrificar funcionalidad.

============================================================
REGLA PRINCIPAL
===============

NO rediseñes todavía las páginas completas.

Primero construye los fundamentos visuales y componentes reutilizables.

No dupliques estilos página por página.

Todo lo que pueda reutilizarse debe convertirse en un componente o token compartido.

============================================================

1. DESIGN TOKENS
   ============================================================

Crea un sistema centralizado de tokens para:

### Colores

Define:

* fondo principal;
* fondo secundario;
* superficie;
* superficie elevada;
* texto principal;
* texto secundario;
* texto tenue;
* borde;
* estado activo;
* éxito;
* advertencia;
* error;
* información;
* acción primaria;
* acción secundaria.

Los colores deben tener suficiente contraste.

Evita utilizar demasiados colores.

La interfaz debe sentirse limpia.

### Tipografía

Define una jerarquía consistente:

* display;
* h1;
* h2;
* h3;
* body;
* body pequeño;
* caption;
* label.

Debe funcionar perfectamente en móvil y escritorio.

Los títulos no deben provocar overflow.

Utiliza una familia tipográfica moderna y profesional compatible con la aplicación actual.

No introduzcas dependencias innecesarias.

### Espaciado

Define una escala consistente.

Por ejemplo:

4
8
12
16
20
24
32
40
48
64
80
96

No es obligatorio utilizar exactamente estos valores si el proyecto actual tiene una escala mejor.

Lo importante es eliminar espaciados arbitrarios y mantener consistencia.

### Border radius

Define radios reutilizables para:

* elementos pequeños;
* inputs;
* botones;
* cards;
* modales;
* imágenes;
* contenedores.

Adornos Remático debe utilizar bordes redondeados de manera consistente.

No conviertas absolutamente todo en una cápsula.

### Sombras

Define pocos niveles de sombra.

Las sombras deben ser sutiles.

No utilizar sombras exageradas.

============================================================
2. COMPONENTES BASE
===================

Crea o normaliza componentes reutilizables para:

* Button
* IconButton
* Input
* SearchInput
* Select
* Checkbox
* Radio
* Switch
* Badge
* Card
* Modal
* Drawer
* Tooltip
* Dropdown
* Tabs
* Breadcrumb
* Pagination
* Skeleton
* Spinner
* EmptyState
* ErrorState
* Toast
* Alert
* Image
* Avatar si realmente es necesario
* Divider

Antes de crear un componente nuevo revisa si ya existe uno equivalente.

No dupliques componentes.

============================================================
3. BOTONES
==========

Los botones deben ser fáciles de identificar y utilizar.

Define claramente:

* primary;
* secondary;
* tertiary;
* destructive;
* ghost;
* icon.

Cada botón debe tener:

* estado normal;
* hover;
* active;
* focus;
* disabled;
* loading.

En móvil:

Los botones deben tener un área táctil cómoda.

Evita botones demasiado pequeños.

No coloques demasiados botones juntos.

============================================================
4. INPUTS
=========

Los campos de formulario deben ser:

* claros;
* grandes;
* fáciles de tocar;
* fáciles de leer;
* consistentes.

Cada input debe soportar correctamente:

* normal;
* focus;
* error;
* disabled;
* validación;
* placeholder.

Los mensajes de error deben aparecer cerca del campo correspondiente.

No depender exclusivamente del color para comunicar errores.

============================================================
5. CARDS
========

Crear una card de producto reutilizable.

Debe estar preparada para utilizar posteriormente:

* imagen;
* nombre;
* categoría;
* unidad de venta;
* estado cuando corresponda;
* acciones administrativas cuando corresponda.

La card debe tener una composición visual limpia.

La fotografía debe tener protagonismo.

Evita llenar la card de información innecesaria.

Debe funcionar correctamente en:

* 1 columna;
* 2 columnas;
* 3 columnas;
* 4 columnas;
* pantallas grandes.

============================================================
6. IMÁGENES
===========

Crear un comportamiento consistente para imágenes.

Las imágenes deben:

* mantener proporciones;
* evitar deformaciones;
* tener estados de carga;
* tener fallback;
* manejar imágenes inexistentes;
* cargar de forma eficiente.

Preparar componentes reutilizables para:

* imagen de producto;
* imagen principal;
* thumbnail;
* galería.

No implementar todavía la galería completa de producto.

============================================================
7. ANIMACIONES
==============

Agregar un sistema de microinteracciones.

Las animaciones deben ser:

* rápidas;
* suaves;
* discretas;
* útiles.

Utilizar animaciones para:

* hover;
* focus;
* aparición de elementos;
* cambios de estado;
* modales;
* dropdowns;
* botones;
* imágenes.

NO utilizar animaciones innecesarias.

NO hacer que una animación bloquee la interacción.

Respetar `prefers-reduced-motion`.

============================================================
8. RESPONSIVE
=============

El Design System debe funcionar desde el principio en:

* 320px;
* 360px;
* 375px;
* 390px;
* 430px;
* 768px;
* 1024px;
* 1280px;
* 1440px;
* pantallas grandes.

Regla absoluta:

NUNCA debe aparecer overflow horizontal accidental.

Los componentes deben poder utilizarse cómodamente con una sola mano en móvil cuando corresponda.

Los textos deben poder crecer sin romper layouts.

No utilizar dimensiones rígidas innecesarias.

Evitar alturas fijas que puedan cortar contenido.

============================================================
9. LAYOUT
=========

Crear primitivas reutilizables para:

* Container;
* Stack;
* Row;
* Grid;
* Section;
* Page;
* Sidebar;
* Header.

El sistema debe permitir construir páginas sin repetir reglas de layout.

El contenido debe tener un ancho máximo razonable en pantallas grandes.

En móvil debe utilizar prácticamente todo el ancho disponible respetando márgenes cómodos.

============================================================
10. ICONOGRAFÍA
===============

Revisa el sistema de iconos existente.

Si ya existe una librería instalada y adecuada, reutilízala.

No introduzcas varias librerías de iconos para hacer lo mismo.

Los iconos deben:

* tener tamaños consistentes;
* alinearse correctamente;
* no sustituir texto cuando el significado no sea evidente;
* tener estados hover/focus cuando sean interactivos.

============================================================
11. ACCESIBILIDAD
=================

Desde esta fase aplica buenas prácticas:

* contraste suficiente;
* navegación por teclado;
* focus visible;
* labels correctos;
* botones semánticos;
* inputs accesibles;
* aria-label cuando sea necesario;
* textos alternativos para imágenes;
* no depender únicamente del color;
* soporte para reduced motion.

No sacrificar accesibilidad por estética.

============================================================
12. MOBILE FIRST
================

Diseña primero para teléfono vertical.

El diseño debe sentirse natural en una pantalla pequeña.

Después amplía progresivamente para tablet y escritorio.

No hagas simplemente una versión desktop comprimida.

Especialmente:

* navegación;
* botones;
* formularios;
* filtros;
* modales;
* cards;
* galerías;
* tablas.

deben tener comportamiento específico cuando sea necesario.

============================================================
13. STOREFRONT VS ADMIN
=======================

El sistema visual debe permitir dos experiencias.

STOREFRONT:

Más visual.
Más espacio.
Fotografía protagonista.
Sensación de marca.
Descubrimiento.

ADMIN:

Más funcional.
Mayor densidad de información.
Acciones claras.
Productividad.
Lectura rápida.

Ambos deben compartir:

* tipografía;
* colores;
* botones;
* inputs;
* estados;
* radios;
* espaciado;
* componentes base.

No deben parecer dos aplicaciones completamente diferentes.

============================================================
14. ESTADOS
===========

Crear componentes visuales consistentes para:

### Loading

Utilizar skeletons cuando sea apropiado.

### Empty

Explicar qué ocurre y qué puede hacer el usuario.

### Error

Explicar el problema de forma clara y permitir recuperarse cuando sea posible.

### Success

Confirmar acciones sin interrumpir innecesariamente.

### Disabled

Mostrar claramente que una acción no está disponible.

============================================================
15. RENDIMIENTO
===============

El Design System no debe introducir problemas de rendimiento.

Evita:

* librerías innecesarias;
* animaciones costosas;
* componentes excesivamente pesados;
* dependencias duplicadas.

Reutiliza componentes.

============================================================
16. DOCUMENTACIÓN
=================

Documenta brevemente:

* tokens;
* componentes;
* variantes;
* convenciones;
* responsive;
* animaciones.

La documentación debe ser suficiente para que futuras modificaciones mantengan la misma estética.

============================================================
17. VALIDACIÓN
==============

Después de implementar:

1. Ejecuta typecheck.
2. Ejecuta lint.
3. Ejecuta tests.
4. Ejecuta build.
5. Verifica storefront.
6. Verifica admin.
7. Comprueba móvil.
8. Comprueba escritorio.
9. Comprueba que no existe overflow horizontal.
10. Comprueba que las funcionalidades existentes siguen funcionando.

No continúes automáticamente a la siguiente fase.

============================================================
REGLA DE PRESERVACIÓN
=====================

Esta fase es principalmente visual.

NO elimines:

* funcionalidades;
* rutas;
* endpoints;
* modelos;
* autenticación;
* permisos;
* componentes funcionales;
* lógica de negocio.

Si para implementar un componente necesitas modificar código existente, conserva su comportamiento.

Si detectas que una decisión de diseño requiere modificar funcionalidad existente, documenta el problema en lugar de eliminar o reemplazar la funcionalidad.

============================================================
RESULTADO ESPERADO
==================

Al finalizar debe existir una base visual sólida y reutilizable para construir posteriormente:

* Home;
* catálogo;
* filtros;
* página de producto;
* galería;
* administración;
* creación de productos;
* edición de productos;
* gestión de imágenes;
* atributos;
* categorías;
* publicación/despublicación.

Todavía NO implementes esas páginas completas.

Primero deja terminado y probado el Design System.


Sí. Para OpenCode conviene convertir todo esto en un **plan ejecutable por fases**, donde cada prompt tenga una sola responsabilidad y una regla permanente de preservación.

Te recomiendo trabajar así:

### Regla global para todos los prompts

Antes de modificar cualquier cosa, analiza la implementación actual y sus dependencias.

REGLA CRÍTICA:

* No elimines funcionalidades existentes.
* No cambies contratos de API, modelos de datos, autenticación ni lógica de negocio salvo que sea estrictamente necesario y esté explícitamente solicitado.
* No reemplaces una funcionalidad existente por otra.
* No elimines componentes, rutas o estados simplemente porque no los uses en el nuevo diseño.
* Conserva compatibilidad con todas las funcionalidades actuales.
* Si necesitas modificar un componente existente, conserva todo su comportamiento y cambia únicamente lo necesario.
* Antes de terminar, verifica que las funcionalidades existentes siguen funcionando.
* Si encuentras una posible incompatibilidad, detente y explica el problema antes de romperla.
* Haz cambios incrementales y pequeños.
* No hagas refactorizaciones grandes que no estén relacionadas con la tarea actual.
* No inventes funcionalidades innecesarias.

OBJETIVO:
Mejorar UX/UI y calidad visual manteniendo intacto el sistema funcional existente.

## Fase 1 — Auditoría

Primero no le permitas tocar código.

Analiza todo el proyecto antes de modificar código.

Identifica:

1. Arquitectura actual.
2. Storefront.
3. Aplicación administrativa.
4. API.
5. Modelos y relaciones de datos.
6. Rutas.
7. Autenticación y autorización.
8. Funcionalidades existentes.
9. Componentes reutilizables.
10. Sistema de estilos actual.
11. Problemas actuales de UX/UI.
12. Dependencias entre componentes.

Crea un inventario claro de funcionalidades que NO deben perderse durante el rediseño.

No modifiques código todavía.

Al finalizar, propón un plan de implementación incremental para transformar visualmente la aplicación sin alterar su comportamiento.

## Fase 2 — Sistema de diseño

Implementa un sistema de diseño consistente para toda la aplicación.

Objetivo:
Crear una identidad visual premium para Adornos Remático, inspirada en productos creativos, fotografía, espacios limpios y navegación moderna.

Define y aplica de forma reutilizable:

* Tipografía.
* Escala tipográfica.
* Colores.
* Espaciado.
* Bordes.
* Radios.
* Sombras.
* Botones.
* Inputs.
* Selects.
* Badges.
* Cards.
* Estados de carga.
* Estados vacíos.
* Mensajes de error.
* Transiciones.
* Focus states.
* Responsive breakpoints.

Prioriza:
Producto > fotografía > navegación > información > acción.

No rediseñes todavía las páginas completas.

Primero crea los tokens y componentes base necesarios y reemplaza gradualmente estilos duplicados cuando sea seguro.

Conserva todas las funcionalidades existentes.

## Fase 3 — Storefront

Transforma visualmente el storefront utilizando el nuevo sistema de diseño.

Objetivo:
Que Adornos Remático se perciba como una marca premium de productos creativos y no como una interfaz CRUD.

Mejora:

* Header.
* Navegación.
* Página principal.
* Categorías.
* Descubrimiento de productos.
* Cards.
* Buscador.
* Filtros.
* Estados de carga.
* Estados vacíos.
* Responsive.
* Microinteracciones.

Prioriza fotografía y contenido visual.

Reduce ruido visual, bordes y botones innecesarios.

Mantén exactamente las funcionalidades existentes, rutas, consultas, filtros, navegación y datos.

No modifiques API ni modelos.

## Fase 4 — Catálogo

Rediseña únicamente la experiencia visual y UX del catálogo.

El catálogo debe facilitar:

* Descubrir productos.
* Buscar.
* Filtrar.
* Navegar por categorías.
* Comparar visualmente productos.
* Abrir rápidamente un producto.

Mejora especialmente:

* Grid responsive.
* Tamaño de fotografías.
* Jerarquía visual.
* Espaciado.
* Hover.
* Carga de imágenes.
* Estados sin resultados.
* Navegación móvil.

No elimines ninguna funcionalidad actual.

No cambies contratos de API ni estructura de datos.

## Fase 5 — Producto

Esta es una de las fases más importantes.

Rediseña la página de producto para convertirla en una experiencia visual premium.

Prioridad:

Fotografía → producto → variantes → información → acción.

Crea una composición clara con:

* Galería grande.
* Miniaturas.
* Imagen principal.
* Cambio fluido de imágenes.
* Información del producto.
* Descripción.
* Detalles.
* Atributos.
* Variantes.
* Estados de disponibilidad.
* Lista de consulta.
* WhatsApp.

Cuando el usuario seleccione una variante, conserva y mejora el comportamiento actual de las imágenes asociadas a esa variante.

La fotografía debe tener protagonismo y suficiente espacio visual.

Optimiza especialmente móvil.

No elimines ninguna funcionalidad existente.

## Fase 6 — Admin

Rediseña visualmente el panel administrativo.

El objetivo es que administrar productos sea rápido, claro y agradable.

No copies literalmente el diseño del storefront.

Crea una interfaz profesional de administración con:

* Navegación clara.
* Dashboard limpio.
* Productos.
* Categorías.
* Estados.
* Búsqueda.
* Filtros.
* Acciones rápidas.
* Feedback visual.
* Estados de carga.
* Estados vacíos.
* Confirmaciones.
* Responsive.

Mantén todas las funcionalidades administrativas existentes.

No modifiques lógica de negocio ni contratos de API.

## Fase 7 — Product Builder

Transforma la creación y edición de productos en un flujo guiado.

Organiza el proceso visualmente en:

01 Información
02 Fotografías
03 Variaciones
04 Detalles
05 Vista previa
06 Publicación

Cada etapa debe ser clara y no abrumar al usuario.

Permite avanzar y retroceder sin perder información.

Integra las capacidades existentes de:

* Nombre.
* Descripción.
* Categoría.
* Estado.
* Imágenes.
* Orden de imágenes.
* Atributos.
* Valores.
* Variantes.
* Imágenes asociadas.
* Productos destacados.
* Otros campos existentes.

No elimines campos existentes.

No cambies el modelo de datos si no es necesario.

El Product Builder debe adaptar la interfaz existente, no reemplazar arbitrariamente la lógica actual.

## Fase 8 — Upload de imágenes

Mejora profundamente la UX para gestionar imágenes de productos.

Implementa o mejora, utilizando la funcionalidad existente:

* Drag & drop.
* Selección múltiple.
* Preview.
* Reordenamiento.
* Imagen principal.
* Eliminación.
* Estados de carga.
* Progreso.
* Errores.
* Asociación con variantes cuando corresponda.

La interfaz debe hacer evidente qué imagen corresponde a cada producto, atributo o variante.

No rompas el flujo actual de almacenamiento ni cambies la API sin necesidad.

## Fase 9 — Vista previa

Implementa una vista previa del producto dentro del administrador.

La vista previa debe representar lo más fielmente posible cómo verá el producto un cliente en el storefront.

Debe utilizar los datos que el administrador está editando actualmente.

Debe actualizarse cuando cambien:

* Nombre.
* Descripción.
* Imágenes.
* Orden.
* Atributos.
* Variantes.
* Estado.
* Detalles.

No dupliques innecesariamente la lógica de negocio.

Reutiliza componentes del storefront cuando sea apropiado para evitar inconsistencias.

## Fase 10 — Responsive

Haz una auditoría completa de responsive en storefront y admin.

Prueba especialmente:

* 320px.
* 375px.
* 390px.
* 430px.
* Tablet.
* 768px.
* 1024px.
* Desktop.
* Pantallas grandes.

Corrige:

* Overflow horizontal.
* Imágenes deformadas.
* Texto cortado.
* Botones fuera de pantalla.
* Grids incorrectos.
* Modales demasiado grandes.
* Formularios incómodos.
* Navegación móvil.
* Galerías.
* Tablas.
* Product Builder.

No cambies funcionalidades para solucionar problemas responsive.

Mantén una experiencia coherente entre dispositivos.

## Fase 11 — Pulido final

Realiza una revisión final de UX/UI de toda la aplicación.

Busca inconsistencias en:

* Tipografía.
* Espaciado.
* Tamaños.
* Botones.
* Inputs.
* Iconos.
* Estados.
* Animaciones.
* Responsive.
* Fotografías.
* Navegación.
* Accesibilidad.

Elimina únicamente inconsistencias visuales o problemas UX.

No agregues funcionalidades innecesarias.

No elimines funcionalidades existentes.

## Fase 12 — Verificación

Esta fase es obligatoria después del rediseño.

Haz una auditoría completa después de todos los cambios.

Verifica que continúan funcionando:

* Storefront.
* Catálogo.
* Búsqueda.
* Filtros.
* Categorías.
* Página de producto.
* Galería.
* Variantes.
* Atributos.
* Imágenes.
* Lista de consulta.
* WhatsApp.
* Login.
* Autenticación.
* Autorización.
* Admin.
* Crear producto.
* Editar producto.
* Eliminar producto.
* Estados.
* Categorías.
* Subida de imágenes.
* Orden de imágenes.
* Relaciones entre imágenes y variantes.
* Publicación.
* Estados de productos.
* API.
* Base de datos.

Ejecuta las pruebas existentes y agrega pruebas únicamente donde sea necesario.

Si detectas una regresión causada por el rediseño, corrígela sin eliminar ninguna funcionalidad.

No hagas cambios visuales adicionales hasta terminar esta verificación.

Entrega un resumen de:

1. Funcionalidades verificadas.
2. Pruebas ejecutadas.
3. Problemas encontrados.
4. Problemas corregidos.
5. Problemas pendientes.

### Orden recomendado

No se los daría todos de una vez a OpenCode. Ejecutaría:

**1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12**

Y después de **cada prompt**, dejaría que OpenCode pruebe el proyecto antes de pasar al siguiente.

La idea central es que OpenCode no interprete *“hazlo más bonito”* como permiso para reescribir el proyecto. Cada fase debe tener un **alcance cerrado + preservación de funcionalidades + verificación**.
