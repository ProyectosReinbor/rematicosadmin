/** Las seis categorías principales se identifican por slug estable, nunca por icono. */
export const BASE_CATEGORIES = [
  {
    slug: 'confeccion',
    name: 'Confección',
    icon: '👗',
    description: 'Cintas, elásticos y accesorios de confección.',
    sortOrder: 10,
  },
  {
    slug: 'agujas',
    name: 'Agujas',
    icon: '🪡',
    description: 'Agujas para costura, bordado y tejido.',
    sortOrder: 20,
  },
  {
    slug: 'hilos',
    name: 'Hilos',
    icon: '🧵',
    description: 'Hilos para coser y bordar.',
    sortOrder: 30,
  },
  {
    slug: 'decoracion',
    name: 'Decoración',
    icon: '🎀',
    description: 'Adornos y detalles para tus creaciones.',
    sortOrder: 40,
  },
  {
    slug: 'lanas',
    name: 'Lanas',
    icon: '🧶',
    description: 'Lanas para tejido, crochet y manualidades.',
    sortOrder: 50,
  },
  {
    slug: 'tijeras',
    name: 'Tijeras',
    icon: '✂️',
    description: 'Tijeras de costura y bordado.',
    sortOrder: 60,
  },
];
export const isBaseCategory = (slug: string) =>
  BASE_CATEGORIES.some((category) => category.slug === slug) || slug === 'confaccion';
export const TIPO_OPTION_NAME = 'Tipo';
