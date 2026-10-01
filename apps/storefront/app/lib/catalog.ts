/** Datos compartidos del catálogo público. */

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Emoji. Solo las categorías base definidas en código lo tienen. */
  icon: string | null;
}

export interface CatalogTypeOption {
  id: string;
  name: string;
  values: { id: string; value: string }[];
}

/** Nombre con el que el administrador registra los tipos de un producto. */
export const TIPO_OPTION_NAME = 'tipo';

/**
 * Las categorías con icono son las definidas en código y se muestran en la
 * barra de iconos del catálogo; las que se crean desde el admin no tienen icono
 * y se listan en la ventana /categorias.
 */
export const splitCategories = (categories: CatalogCategory[]) => ({
  base: categories.filter((c) =>
    ['confeccion', 'agujas', 'hilos', 'decoracion', 'lanas', 'tijeras'].includes(c.slug),
  ),
  extra: categories.filter(
    (c) => !['confeccion', 'agujas', 'hilos', 'decoracion', 'lanas', 'tijeras'].includes(c.slug),
  ),
});

/** Devuelve el atributo "Tipo" del producto, si tiene. */
export const getTipoOption = (options: CatalogTypeOption[]) =>
  options.find((o) => o.name.trim().toLowerCase() === TIPO_OPTION_NAME);
