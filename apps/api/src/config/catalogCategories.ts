/**
 * Catálogo de categorías base del catálogo público.
 *
 * Estas categorías NO se administran desde el panel: están definidas aquí y
 * `ensureBaseCategories()` las inserta/actualiza en la base de datos al
 * arrancar la API, de modo que la columna `categories.icon` quede poblada.
 *
 * La distinción entre base y adicional es exactamente esa columna:
 *  - Categoría con `icon`  -> se muestra en la barra de iconos de /products.
 *  - Categoría sin `icon`  -> se muestra en la ventana /categorias.
 *
 * El nombre de las categorías base sí se puede renombrar desde el admin: el
 * arranque solo crea las que faltan y rellena el icono de las que ya existen.
 */
export interface BaseCatalogCategory {
  slug: string;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export const BASE_CATEGORIES: BaseCatalogCategory[] = [
  {
    slug: "accesorios-y-herramientas",
    name: "Accesorios y Herramientas",
    icon: "🧵",
    description: "Herramientas y accesorios básicos para el taller de confección.",
    sortOrder: 10,
  },
  {
    slug: "agujas",
    name: "Agujas",
    icon: "🪡",
    description: "Agujas de coser, de mano y para máquinas, en distintos calibres.",
    sortOrder: 20,
  },
  {
    slug: "alfileres",
    name: "Alfileres",
    icon: "📍",
    description: "Alfileres con cabeza, sin cabeza y especiales para sujetar y marcar.",
    sortOrder: 30,
  },
  {
    slug: "confaccion",
    name: "Confección",
    icon: "👗",
    description: "Cintas, elásticos, forros y avíos para confección.",
    sortOrder: 40,
  },
  {
    slug: "decoracion",
    name: "Decoración",
    icon: "🎀",
    description: "Adornos, guirnaldas, moños y detalles para decorar.",
    sortOrder: 50,
  },
  {
    slug: "hilos",
    name: "Hilos",
    icon: "🧶",
    description: "Hilos de coser y bordar en múltiples colores y calibres.",
    sortOrder: 60,
  },
  {
    slug: "lanas",
    name: "Lanas",
    icon: "🐑",
    description: "Lanas e hilos de lana para tejer, crochet y manualidades.",
    sortOrder: 70,
  },
  {
    slug: "tijeras",
    name: "Tijeras",
    icon: "✂️",
    description: "Tijeras de costura, bordado, manuales y de atelier.",
    sortOrder: 80,
  },
];

/**
 * Nombre del atributo de producto que el catálogo trata como "Tipo".
 * Ej. en la categoría Confección, el producto Cinta puede tener los tipos
 * Agua, Doble razo, Floral, Fusionable y Satinada.
 */
export const TIPO_OPTION_NAME = "Tipo";
