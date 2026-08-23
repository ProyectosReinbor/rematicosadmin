export interface Product {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  detalles: string;
  precio_desde: number;
  moneda: string;
  precio_texto: string;
  boton_texto: string;
  imagen: string;
}

export const categories = [
  "Todos",
  "bisuteria",
  "confeccion",
  "lanas",
  "manualidades",
  "maquinaria",
  "hilos",
  "empaques",
  "accesorios",
];

export const products: Product[] = [
  {
    id: "dijes-futbol",
    titulo: "Dijes Escudos Deportivos en Resina y Metal",
    categoria: "bisuteria",
    descripcion:
      "¡Lleva la pasión por tu equipo a todas partes! Diseños detallados con los escudos de tus clubes favoritos, ideales para personalizar tus pulseras o cadenas.",
    detalles:
      "Disponibles con pasador lateral o aro superior (Nacional, Millonarios, Santa Fe, América, Selección Colombia y más).",
    precio_desde: 1500,
    moneda: "COP",
    precio_texto: "Desde $1.500 COP c/u",
    boton_texto: "¡Elige tu equipo favorito!",
    imagen: "/imagenes maps/dijes cadenas pulseras.png",
  },
  {
    id: "insumos-fajas",
    titulo: "Kit de Insumos Especializados para Fajas y Lencería",
    categoria: "confeccion",
    descripcion:
      "Dale a tus prendas el ajuste perfecto y la durabilidad que tus clientes buscan. Contamos con abrochaduras de corchete, cierres reforzados, encajes siliconados y elásticos de alta resistencia.",
    detalles: "Venta por metros o por rollos completos.",
    precio_desde: 0,
    moneda: "COP",
    precio_texto: "Cotización según referencia",
    boton_texto: "Cotiza tus insumos aquí",
    imagen: "/imagenes maps/insumos_fajas.png",
  },
  {
    id: "lana-mega",
    titulo: "Lana Escolar MEGA – Explosión de Color",
    categoria: "lanas",
    descripcion:
      "Ideal para manualidades escolares, amigurumis o prendas tejidas a mano. Su textura antialérgica y suave al tacto la hace perfecta para cualquier proyecto creativo.",
    detalles:
      "Ovillos de 15g en paquete x 10 unidades o por unidad. Amplia gama de colores vivos y neutros.",
    precio_desde: 8000,
    moneda: "COP",
    precio_texto: "$8.000 COP (Paquete x 10)",
    boton_texto: "¡Pide tu catálogo de colores!",
    imagen: "/imagenes maps/lana escolar.png",
  },
  {
    id: "cuentas-metalizadas",
    titulo: "Cuentas y Balines Metalizados para Bisutería",
    categoria: "bisuteria",
    descripcion:
      "Agrega un toque de brillo y elegancia a tus accesorios. Balines labrados y lisos en tonos dorado, plateado, bronce y oro rosa que no pierden su encanto.",
    detalles: "Organizadores por tamaños y acabados.",
    precio_desde: 3000,
    moneda: "COP",
    precio_texto: "Desde $3.000 COP el paquete",
    boton_texto: "Armar mi pedido",
    imagen: "/imagenes maps/bisuteria.png",
  },
  {
    id: "surtido-bisuteria",
    titulo: "Cuentas y Muranos Surtidos para Crear a Tu Gusto",
    categoria: "bisuteria",
    descripcion:
      "¡Deja volar tu imaginación! Variedad de figuritas, letras, perlas, maderas y caracoles para armar accesorios únicos, divertidos y llenos de personalidad.",
    detalles:
      "Bolsitas individuales marcadas por valor ($3.000, $4.000, $5.000, $8.000).",
    precio_desde: 3000,
    moneda: "COP",
    precio_texto: "Desde $3.000 COP por bolsita",
    boton_texto: "¡Quiero mis materiales!",
    imagen: "/imagenes maps/bisuteria0.png",
  },
  {
    id: "cauchos-elasticos",
    titulo: "Caucho Elástico Industrial y Modistería",
    categoria: "confeccion",
    descripcion:
      "Flexibilidad y resistencia garantizada para confección de prendas, tapabocas o manualidades. Mantienen su forma tras múltiples lavados.",
    detalles:
      "Rollos de 100 metros (3mm, 5mm y 10mm) en colores blanco y negro.",
    precio_desde: 0,
    moneda: "COP",
    precio_texto: "Consultar precio por rollo o metro",
    boton_texto: "Comprar por rollo",
    imagen: "/imagenes maps/cauchos.png",
  },
  {
    id: "chelines-limpiapipas",
    titulo: "Chelines Moldeables Multi-Color",
    categoria: "manualidades",
    descripcion:
      "El material favorito para manualidades escolares, decoración y figuras creativas. Fáciles de doblar, suaves y en una variedad increíble de colores fosforescentes y clásicos.",
    detalles: "Paquetes x 100 unidades.",
    precio_desde: 5000,
    moneda: "COP",
    precio_texto: "$5.000 COP (Paquete)",
    boton_texto: "Llévalos en tus colores favoritos",
    imagen: "/imagenes maps/chelines.png",
  },
  {
    id: "maquinaria-troqueles",
    titulo: "Máquina Remachadora y Troqueles de Confección",
    categoria: "maquinaria",
    descripcion:
      "La herramienta indispensable para tu taller o negocio. Troquela y coloca ojaletes, remaches para jean, botones y broches con total precisión y sin esfuerzo.",
    detalles:
      "Máquina verde reforzada + troqueles e insumos según tu necesidad (Inoxidable, plástico, metálico).",
    precio_desde: 0,
    moneda: "COP",
    precio_texto: "Cotiza tu kit completo",
    boton_texto: "Asesoría personal en troqueles",
    imagen: "/imagenes maps/herrajes.png",
  },
  {
    id: "cristal-murano",
    titulo: "Tiras de Cristal Murano Multifacético",
    categoria: "bisuteria",
    descripcion:
      "Dale un brillo radiante y profesional a tus accesorios. Cristales facetados en una hermosa variedad de colores que capturan la luz perfectamente. Ideales para armar collares, pulseras, rosarios y aretes de lujo.",
    detalles:
      "Tiras completas organizadas por gama de color y tamaño de balín.",
    precio_desde: 4000,
    moneda: "COP",
    precio_texto: "Desde $4.000 COP la tira",
    boton_texto: "¡Elige tus colores favoritos!",
    imagen: "/imagenes maps/piedra_murano.png",
  },
  {
    id: "lana-nube",
    titulo: "Lana NUBE – Suavidad y Textura Incomparables",
    categoria: "lanas",
    descripcion:
      "Tejidos suaves que enamoran al tacto. La lana NUBE es perfecta para crear buzos, bufandas, cobijas o Amigurumis con un acabado esponjoso y colores vibrantes que duran.",
    detalles:
      "Ovillos individuales en colores pasteles, vivos, neutros y matizados.",
    precio_desde: 6500,
    moneda: "COP",
    precio_texto: "$6.500 COP por ovillo",
    boton_texto: "Armar mi paleta de lanas",
    imagen: "/imagenes maps/lana.png",
  },
  {
    id: "hilos-macrame-crochet",
    titulo: "Hilos Especializados para Crochet, Macramé y Tejido",
    categoria: "hilos",
    descripcion:
      "¡Todo lo que necesitas para tu arte en un solo lugar! Hilos de alta resistencia, textura uniforme y tonos espectaculares para bolsos, mochilas, tapices y prendas tejidas a mano.",
    detalles:
      "Conos y ovillos en hilo orlón, algodón para macramé, crochet y pañolenci/fieltro.",
    precio_desde: 0,
    moneda: "COP",
    precio_texto: "Consultar según tipo e hilo",
    boton_texto: "Ver disponibilidad de hilos",
    imagen: "/imagenes maps/macrame orlon hilo lana guajira crochet.png",
  },
  {
    id: "papel-coreano",
    titulo: "Papel Coreano Estampado para Flores y Regalos",
    categoria: "empaques",
    descripcion:
      "Haz que tus detalles e intenciones destaquen a primera vista. Papel coreano impermeable con diseños hermosos (flores, corazones, moños y bordes dorados), perfecto para envolver ramos de flores o regalos especiales.",
    detalles: "Pliegos individuales o paquetes por motivos surtidos.",
    precio_desde: 1200,
    moneda: "COP",
    precio_texto: "Desde $1.200 COP la hoja",
    boton_texto: "Ver catálogo de estampados",
    imagen: "/imagenes maps/papel_coreano.png",
  },
  {
    id: "parches-ropa",
    titulo: "Parches Bordados y Termoadhesivos Multiestilo",
    categoria: "accesorios",
    descripcion:
      "¡Renuévate y dale personalidad a tus prendas! Parches fáciles de aplicar con calor o costura sobre chaquetas, jeans, gorras o maletas. Diseños de rock, anime, superhéroes, espacio, marcas y figuras de moda.",
    detalles: "Diseños variados organizados por referencias numeradas.",
    precio_desde: 2500,
    moneda: "COP",
    precio_texto: "Desde $2.500 COP c/u",
    boton_texto: "¡Escoge tus parches favoritos!",
    imagen: "/imagenes maps/parches para ropa.png",
  },
];
