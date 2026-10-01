
import React, { useState } from 'react';
import {
    Search,
    Heart,
    ShoppingCart,
    User,
    Phone,
    Mail,
    MapPin,
    ChevronDown,
    Facebook,
    Instagram,
    MessageCircle,
    BookOpen,
    Truck,
    Headphones,
    Award,
    Building2,
    HelpCircle,
    Grid,
    Scissors,
    Sparkles,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Tipos para los productos
interface Product {
    id: number;
    name: string;
    image: string;
    isFavorite?: boolean;
}

const MegaImportHome: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Inicio');

    // Datos de ejemplo para las categorías con sus iconos y etiquetas
    const categories = [
        { name: 'ACCESORIOS Y HERRAMIENTAS', icon: '🧵' },
        { name: 'AGUJAS', icon: '🪡' },
        { name: 'ALFILERES', icon: '📍' },
        { name: 'CONFECCIÓN', icon: '👗' },
        { name: 'DECORACIÓN', icon: '🎀' },
        { name: 'HILOS', icon: '🧶' },
        { name: 'LANAS', icon: '🐑' },
        { name: 'TIJERAS', icon: '✂️' },
        { name: 'MÁS CATEGORÍAS', icon: '🔲' },
    ];

    // Datos de los productos de la sección "Nuevos Productos"
    const newProducts: Product[] = [
        {
            id: 1,
            name: 'Aguja Curva No 6 (4") Paquete x 25 Unidades',
            image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 2,
            name: 'Ojos Moviles 30mm Paquete x 200 Pcs',
            image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 3,
            name: 'Paño Lency Café Oscuro Col B031',
            image: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 4,
            name: 'Organizador Plástico Para Hilos - Paquete x 5 unidades',
            image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 5,
            name: 'Lápiz Tiza Retráctil Blanco con Repuestos (Paquete x 20 minas)',
            image: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 6,
            name: 'Tijera Mango de Gato Rosado',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
        },
    ];

    return (
        <div>
            < div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-2 pt-2 border-t border-red-700/50 text-xs" >
                <div className="flex flex-wrap items-center gap-4">
                    <a href="mailto:ventas@megaimport.co" className="flex items-center gap-1 hover:underline">
                        <Mail size={13} /> ventas@megaimport.co
                    </a>
                    <a href="tel:+573106091188" className="flex items-center gap-1 hover:underline">
                        <Phone size={13} /> +57 310 609 1188
                    </a>
                    <div className="flex items-center gap-2 ml-2">
                        <Facebook size={13} className="cursor-pointer hover:opacity-80" />
                        <Instagram size={13} className="cursor-pointer hover:opacity-80" />
                        <span className="text-[10px] bg-white text-red-700 rounded-full px-1 font-bold">TikTok</span>
                        <MessageCircle size={13} className="cursor-pointer hover:opacity-80" />
                        <MapPin size={13} className="cursor-pointer hover:opacity-80" />
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0 cursor-pointer hover:underline">
                    <User size={15} />
                    <span>Bienvenido! <strong className="underline">Ingresa / Regístrate</strong></span>
                </div>
            </div >

            < header className="border-b border-gray-200 py-4 px-4 bg-white sticky top-0 z-40" >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="bg-[#b31d1d] text-white p-3 rounded-lg shadow-md inline-block text-center">
                            <div className="font-black text-2xl tracking-tighter leading-none border-b border-yellow-400 pb-1">
                                MEGA <span className="text-yellow-400">IMPORT</span>
                            </div>
                            <div className="text-[9px] uppercase tracking-wider mt-1 text-gray-200">
                                Adornos e Insumos para la confección
                            </div>
                        </div>
                        <div className="hidden lg:block text-xs text-gray-500 border-l pl-4 border-gray-300">
                            <p className="font-bold text-red-700 uppercase">Importadores Directos</p>
                            <p>+2.500 referencias para su negocio</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl w-full relative">
                        <input
                            type="text"
                            placeholder="Busca por marca, tijeras, agujas, hilos..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-red-600 bg-gray-50"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-700">
                            <Search size={18} />
                        </button>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-5 text-gray-700">
                        <button className="relative hover:text-red-700">
                            <Heart size={22} />
                        </button>
                        <button className="relative hover:text-red-700">
                            <ShoppingCart size={22} />
                        </button>
                    </div>
                </div>
            </header >

            {/* 3. NAVIGATION BAR */}
            < nav className="border-b border-gray-200 bg-white" >
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 text-sm font-medium">
                    <div className="flex items-center gap-1 overflow-x-auto py-2">
                        <button
                            onClick={() => setActiveTab('Inicio')}
                            className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'Inicio' ? 'bg-[#b31d1d] text-white font-bold' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Inicio
                        </button>
                        <div className="relative group">
                            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1">
                                Productos <ChevronDown size={14} />
                            </button>
                        </div>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            Distribuidores
                        </button>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            Nosotros
                        </button>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            Servicio al cliente
                        </button>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            Contacto
                        </button>
                    </div>

                    {/* Catálogo Digital Button */}
                    <div className="py-2">
                        <button className="bg-[#b31d1d] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-red-800 transition-colors shadow-sm relative">
                            <span className="absolute -top-2 right-2 bg-black text-[9px] px-1 text-white rounded font-normal uppercase">
                                Actualizado
                            </span>
                            <BookOpen size={16} /> CATÁLOGO DIGITAL
                        </button>
                    </div>
                </div>
            </nav >

            {/* 4. CATEGORIES BAR WITH ICONS */}
            < section className="bg-gray-50 border-b border-gray-200 py-6" >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 text-center">
                        {categories.map((cat, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-xl mb-2 group-hover:scale-105 group-hover:bg-pink-100 transition-all shadow-sm">
                                    {cat.icon}
                                </div>
                                <span className="text-[10px] font-bold text-gray-700 leading-tight tracking-tight uppercase group-hover:text-red-700">
                                    {cat.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* 5. HERO BANNER */}
            < section className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 py-16 px-4 overflow-hidden border-b border-gray-200" >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white hidden md:block">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="text-center w-full my-8">
                        <h1 className="text-3xl md:text-5xl font-black text-[#3a1b12] tracking-tight mb-4">
                            El arte de tejer comienza <br /> con la calidad de nuestras
                        </h1>
                    </div>

                    <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white hidden md:block">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section >

            {/* 6. NUEVOS PRODUCTOS SECTION */}
            < section className="py-12 px-4 max-w-7xl mx-auto" >
                <div className="text-center mb-10">
                    <span className="text-xs text-gray-400 font-bold tracking-widest block mb-1">
                        Inicio
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-wide uppercase inline-block relative pb-2">
                        ¡NUEVOS PRODUCTOS!
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#b31d1d]"></span>
                    </h2>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {newProducts.map((product) => (
                        <div
                            key={product.id}
                            className="border border-gray-200 rounded-lg p-3 bg-white flex flex-col justify-between hover:shadow-md transition-shadow relative"
                        >
                            <button className="absolute top-4 right-4 text-red-500 hover:text-red-700 z-10">
                                <Heart size={18} className="fill-transparent stroke-current" />
                            </button>

                            <div className="h-40 w-full mb-3 flex items-center justify-center overflow-hidden rounded">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-contain h-full w-full hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-800 line-clamp-3 mb-4 h-12">
                                    {product.name}
                                </h3>

                                <div className="bg-gray-100 p-2 rounded border-l-2 border-red-600 text-left">
                                    <p className="text-[11px] text-red-600 font-medium leading-tight">
                                        Ingrese a su cuenta para ver el precio
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section >

            {/* 7. FOOTER */}
            < footer className="bg-[#0e0f11] text-gray-300 pt-16 pb-8 border-t border-gray-800" >
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Column 1: Brand Info */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                            MEGA IMPORT
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6">
                            Mega Import es una empresa importadora y comercializadora de insumos
                            para confección, industria textil y manualidades. Contamos con un amplio
                            portafolio de productos para clientes mayoristas en toda Colombia.
                        </p>
                        <div className="flex items-center gap-3 text-white">
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                                <span className="text-xs font-bold">Tk</span>
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                                <MessageCircle size={16} />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                                <MapPin size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Productos */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                            PRODUCTOS
                        </h3>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li>• Accesorios y herramientas</li>
                            <li>• Agujas</li>
                            <li>• Alfileres</li>
                            <li>• Confección</li>
                            <li>• Decoración</li>
                            <li>• Hilos</li>
                            <li>• Lanas</li>
                            <li>• Recordatorios</li>
                            <li>• Tijeras</li>
                            <li>• Otros</li>
                        </ul>
                    </div>

                    {/* Column 3: Información */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                            INFORMACIÓN
                        </h3>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li>• Servicio al cliente</li>
                            <li>• Mi cuenta</li>
                            <li>• Mis pedidos</li>
                            <li>• Política de envíos</li>
                            <li>• Política de devoluciones</li>
                            <li>• Política de cancelación de pedidos</li>
                            <li>• Protección de datos personales</li>
                        </ul>
                    </div>

                    {/* Column 4: Contacto */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                            CONTACTO
                        </h3>
                        <div className="text-xs space-y-3 text-gray-400">
                            <p>(+57) 310 609 1188</p>
                            <p>(+57) 310 360 5249</p>
                            <p className="mt-4">Calle 53 # 16 - 33, Oficina 301</p>
                            <p>Bogotá D.C., Colombia</p>
                            <p className="text-white underline cursor-pointer">Ver Ubicación</p>
                            <p className="mt-4 text-gray-500">Lunes a Viernes: 8:00 - 17:00</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Benefits Bar */}
                <div className="border-t border-gray-800 pt-8 max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase">+2.500 REFERENCIAS</h4>
                            <p className="text-xs text-gray-400 mt-1">Para confección y manualidades</p>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase">ENVÍOS A TODA COLOMBIA</h4>
                            <p className="text-xs text-gray-400 mt-1">Cobertura nacional</p>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase">ASESORÍA MAYORISTA</h4>
                            <p className="text-xs text-gray-400 mt-1">Atención personalizada</p>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase">IMPORTACIÓN DIRECTA</h4>
                            <p className="text-xs text-gray-400 mt-1">Productos para su negocio</p>
                        </div>
                    </div>
                </div>
            </footer >

            {/* FLOATING BUTTONS */}
            {/* Novedades Button */}
            <button className="fixed right-4 bottom-20 bg-[#b31d1d] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-red-800 transition-colors flex items-center gap-1 z-50">
                <Sparkles size={14} /> NOVEDADES
            </button>

            {/* WhatsApp Button */}
            <a
                href="https://wa.me/573106091188"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed right-4 bottom-4 bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 transition-colors z-50 flex items-center justify-center"
            >
                <MessageCircle size={28} className="fill-current" />
            </a>
        </div>
    );
};

export default MegaImportHome;



// Referencia 2 ventana de categorias, productos y sus tipos
// Barra de navegacion desplegable

import React, { useState } from 'react';
import {
    Search,
    Heart,
    ShoppingCart,
    User,
    Phone,
    Mail,
    MapPin,
    ChevronDown,
    Facebook,
    Instagram,
    MessageCircle,
    BookOpen,
    Truck,
    Headphones,
    Award,
    Building2,
    HelpCircle,
    Grid,
    Scissors,
    Sparkles,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Tipos para los productos
interface Product {
    id: number;
    name: string;
    image: string;
    isFavorite?: boolean;
}

const MegaImportHome: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Inicio');

    // Datos de ejemplo para las categorías con sus iconos y etiquetas
    const categories = [
        { name: 'ACCESORIOS Y HERRAMIENTAS', icon: '🧵' },
        { name: 'AGUJAS', icon: '🪡' },
        { name: 'ALFILERES', icon: '📍' },
        { name: 'CONFECCIÓN', icon: '👗' },
        { name: 'DECORACIÓN', icon: '🎀' },
        { name: 'HILOS', icon: '🧶' },
        { name: 'LANAS', icon: '🐑' },
        { name: 'TIJERAS', icon: '✂️' },
        { name: 'MÁS CATEGORÍAS', icon: '🔲' },
    ];

    // Datos de los productos de la sección "Nuevos Productos"
    const newProducts: Product[] = [
        {
            id: 1,
            name: 'Aguja Curva No 6 (4") Paquete x 25 Unidades',
            image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 2,
            name: 'Ojos Moviles 30mm Paquete x 200 Pcs',
            image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 3,
            name: 'Paño Lency Café Oscuro Col B031',
            image: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 4,
            name: 'Organizador Plástico Para Hilos - Paquete x 5 unidades',
            image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 5,
            name: 'Lápiz Tiza Retráctil Blanco con Repuestos (Paquete x 20 minas)',
            image: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 6,
            name: 'Tijera Mango de Gato Rosado',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
        },
    ];

    return (

        {/* 1. TOP BAR RED /}


{/ Info Highlights */}


 Envíos a toda Colombia


 Asesoría Mayorista(L - V 8:00am - 5: 30pm)


        + 2.500 Referencias en insumos textiles


 Solo ventas al por mayor(B2B)


 ¿Cómo comprar ?




    {/* Contact & Login Sub-bar */ }
    < div className = "max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-2 pt-2 border-t border-red-700/50 text-xs" >
      <div className="flex flex-wrap items-center gap-4">
        <a href="mailto:ventas@megaimport.co" className="flex items-center gap-1 hover:underline">
          <Mail size={13} /> ventas@megaimport.co
        </a>
        <a href="tel:+573106091188" className="flex items-center gap-1 hover:underline">
          <Phone size={13} /> +57 310 609 1188
        </a>
        <div className="flex items-center gap-2 ml-2">
          <Facebook size={13} className="cursor-pointer hover:opacity-80" />
          <Instagram size={13} className="cursor-pointer hover:opacity-80" />
          <span className="text-[10px] bg-white text-red-700 rounded-full px-1 font-bold">TikTok</span>
          <MessageCircle size={13} className="cursor-pointer hover:opacity-80" />
          <MapPin size={13} className="cursor-pointer hover:opacity-80" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 md:mt-0 cursor-pointer hover:underline">
        <User size={15} />
        <span>Bienvenido! <strong className="underline">Ingresa / Regístrate</strong></span>
      </div>
    </div >
  </div >

    {/* 2. HEADER MAIN */ }
    < header className = "border-b border-gray-200 py-4 px-4 bg-white sticky top-0 z-40" >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
                <div className="bg-[#b31d1d] text-white p-3 rounded-lg shadow-md inline-block text-center">
                    <div className="font-black text-2xl tracking-tighter leading-none border-b border-yellow-400 pb-1">
                        MEGA <span className="text-yellow-400">IMPORT</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1 text-gray-200">
                        Adornos e Insumos para la confección
                    </div>
                </div>
                <div className="hidden lg:block text-xs text-gray-500 border-l pl-4 border-gray-300">
                    <p className="font-bold text-red-700 uppercase">Importadores Directos</p>
                    <p>+2.500 referencias para su negocio</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl w-full relative">
                <input
                    type="text"
                    placeholder="Busca por marca, tijeras, agujas, hilos..."
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-red-600 bg-gray-50"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-700">
                    <Search size={18} />
                </button>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-5 text-gray-700">
                <button className="relative hover:text-red-700">
                    <Heart size={22} />
                </button>
                <button className="relative hover:text-red-700">
                    <ShoppingCart size={22} />
                </button>
            </div>
        </div>
  </header >

    {/* 3. NAVIGATION BAR */ }
    < nav className = "border-b border-gray-200 bg-white" >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 text-sm font-medium">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
                <button
                    onClick={() => setActiveTab('Inicio')}
                    className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'Inicio' ? 'bg-[#b31d1d] text-white font-bold' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    Inicio
                </button>
                <div className="relative group">
                    <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1">
                        Productos <ChevronDown size={14} />
                    </button>
                </div>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Distribuidores
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Nosotros
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Servicio al cliente
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Contacto
                </button>
            </div>

            {/* Catálogo Digital Button */}
            <div className="py-2">
                <button className="bg-[#b31d1d] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-red-800 transition-colors shadow-sm relative">
                    <span className="absolute -top-2 right-2 bg-black text-[9px] px-1 text-white rounded font-normal uppercase">
                        Actualizado
                    </span>
                    <BookOpen size={16} /> CATÁLOGO DIGITAL
                </button>
            </div>
        </div>
  </nav >

    {/* 4. CATEGORIES BAR WITH ICONS */ }
    < section className = "bg-gray-50 border-b border-gray-200 py-6" >
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 text-center">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center group cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-xl mb-2 group-hover:scale-105 group-hover:bg-pink-100 transition-all shadow-sm">
                            {cat.icon}
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 leading-tight tracking-tight uppercase group-hover:text-red-700">
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
  </section >

    {/* 5. HERO BANNER */ }
    < section className = "relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 py-16 px-4 overflow-hidden border-b border-gray-200" >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white hidden md:block">
                <ChevronLeft size={20} />
            </button>

            <div className="text-center w-full my-8">
                <h1 className="text-3xl md:text-5xl font-black text-[#3a1b12] tracking-tight mb-4">
                    El arte de tejer comienza <br /> con la calidad de nuestras
                </h1>
            </div>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white hidden md:block">
                <ChevronRight size={20} />
            </button>
        </div>
  </section >

    {/* 6. NUEVOS PRODUCTOS SECTION */ }
    < section className = "py-12 px-4 max-w-7xl mx-auto" >
        <div className="text-center mb-10">
            <span className="text-xs text-gray-400 font-bold tracking-widest block mb-1">
                Inicio
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-wide uppercase inline-block relative pb-2">
                ¡NUEVOS PRODUCTOS!
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#b31d1d]"></span>
            </h2>
        </div>

{/* Products Grid */ }
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {newProducts.map((product) => (
        <div
            key={product.id}
            className="border border-gray-200 rounded-lg p-3 bg-white flex flex-col justify-between hover:shadow-md transition-shadow relative"
        >
            <button className="absolute top-4 right-4 text-red-500 hover:text-red-700 z-10">
                <Heart size={18} className="fill-transparent stroke-current" />
            </button>

            <div className="h-40 w-full mb-3 flex items-center justify-center overflow-hidden rounded">
                <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain h-full w-full hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div>
                <h3 className="text-xs font-semibold text-gray-800 line-clamp-3 mb-4 h-12">
                    {product.name}
                </h3>

                <div className="bg-gray-100 p-2 rounded border-l-2 border-red-600 text-left">
                    <p className="text-[11px] text-red-600 font-medium leading-tight">
                        Ingrese a su cuenta para ver el precio
                    </p>
                </div>
            </div>
        </div>
    ))}
</div>
  </section >

    {/* 7. FOOTER */ }
    < footer className = "bg-[#0e0f11] text-gray-300 pt-16 pb-8 border-t border-gray-800" >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div>
                <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                    MEGA IMPORT
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                    Mega Import es una empresa importadora y comercializadora de insumos
                    para confección, industria textil y manualidades. Contamos con un amplio
                    portafolio de productos para clientes mayoristas en toda Colombia.
                </p>
                <div className="flex items-center gap-3 text-white">
                    <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                        <Facebook size={16} />
                    </a>
                    <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                        <Instagram size={16} />
                    </a>
                    <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                        <span className="text-xs font-bold">Tk</span>
                    </a>
                    <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                        <MessageCircle size={16} />
                    </a>
                    <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-red-700 transition-colors">
                        <MapPin size={16} />
                    </a>
                </div>
            </div>

            {/* Column 2: Productos */}
            <div>
                <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                    PRODUCTOS
                </h3>
                <ul className="text-xs space-y-2 text-gray-400">
                    <li>• Accesorios y herramientas</li>
                    <li>• Agujas</li>
                    <li>• Alfileres</li>
                    <li>• Confección</li>
                    <li>• Decoración</li>
                    <li>• Hilos</li>
                    <li>• Lanas</li>
                    <li>• Recordatorios</li>
                    <li>• Tijeras</li>
                    <li>• Otros</li>
                </ul>
            </div>

            {/* Column 3: Información */}
            <div>
                <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                    INFORMACIÓN
                </h3>
                <ul className="text-xs space-y-2 text-gray-400">
                    <li>• Servicio al cliente</li>
                    <li>• Mi cuenta</li>
                    <li>• Mis pedidos</li>
                    <li>• Política de envíos</li>
                    <li>• Política de devoluciones</li>
                    <li>• Política de cancelación de pedidos</li>
                    <li>• Protección de datos personales</li>
                </ul>
            </div>

            {/* Column 4: Contacto */}
            <div>
                <h3 className="text-white text-sm font-bold tracking-wider mb-4 border-b border-red-700 pb-1 inline-block">
                    CONTACTO
                </h3>
                <div className="text-xs space-y-3 text-gray-400">
                    <p>(+57) 310 609 1188</p>
                    <p>(+57) 310 360 5249</p>
                    <p className="mt-4">Calle 53 # 16 - 33, Oficina 301</p>
                    <p>Bogotá D.C., Colombia</p>
                    <p className="text-white underline cursor-pointer">Ver Ubicación</p>
                    <p className="mt-4 text-gray-500">Lunes a Viernes: 8:00 - 17:00</p>
                </div>
            </div>
        </div>

{/* Bottom Benefits Bar */ }
<div className="border-t border-gray-800 pt-8 max-w-7xl mx-auto px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
            <h4 className="text-white text-sm font-bold uppercase">+2.500 REFERENCIAS</h4>
            <p className="text-xs text-gray-400 mt-1">Para confección y manualidades</p>
        </div>
        <div>
            <h4 className="text-white text-sm font-bold uppercase">ENVÍOS A TODA COLOMBIA</h4>
            <p className="text-xs text-gray-400 mt-1">Cobertura nacional</p>
        </div>
        <div>
            <h4 className="text-white text-sm font-bold uppercase">ASESORÍA MAYORISTA</h4>
            <p className="text-xs text-gray-400 mt-1">Atención personalizada</p>
        </div>
        <div>
            <h4 className="text-white text-sm font-bold uppercase">IMPORTACIÓN DIRECTA</h4>
            <p className="text-xs text-gray-400 mt-1">Productos para su negocio</p>
        </div>
    </div>
</div>
  </footer >

    {/* FLOATING BUTTONS */ }
{/* Novedades Button */ }
<button className="fixed right-4 bottom-20 bg-[#b31d1d] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-red-800 transition-colors flex items-center gap-1 z-50">
    <Sparkles size={14} /> NOVEDADES
</button>

{/* WhatsApp Button */ }
<a
    href="https://wa.me/573106091188"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed right-4 bottom-4 bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 transition-colors z-50 flex items-center justify-center"
>
    <MessageCircle size={28} className="fill-current" />
</a>
</div >


);
};

export default MegaImportHome;