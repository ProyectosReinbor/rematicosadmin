'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const whatsapp = (message: string) =>
  `https://wa.me/573113487967?text=${encodeURIComponent(message)}`;
const slides = [
  {
    image: 'slider1.jpg',
    eyebrow: 'LANA',
    title: 'MAXI CHELIN',
    description: '¡Hazlo con MAXI CHELIN!\nExtra suave y gruesa, perfecta para GRANDES proyectos.',
    button: '¡La quiero!',
    href: whatsapp(
      'Hola Rematico Villavicencio, me interesa la lana MAXI CHELIN. ¿La tienen disponible?',
    ),
  },
  {
    image: 'slider2.jpg',
    eyebrow: 'LANA',
    title: 'CHELIN PETIT',
    description:
      '¡Llegó la Chelín Petit! La misma calidad,\nahora más fina para proyectos detallados.',
    button: '¡La quiero!',
    href: whatsapp(
      'Hola Rematico Villavicencio, me interesa la lana CHELIN PETIT. ¿La tienen disponible?',
    ),
  },
  {
    image: 'slider3.jpg',
    eyebrow: '',
    title: 'Tu cadena de suministro empieza aquí.',
    description: 'Encuentra miles de productos. Una sola experiencia: increíble.',
    button: 'Contacto',
    href: whatsapp('Hola Rematico Villavicencio, quisiera información sobre sus productos.'),
  },
  {
    image: 'slider4.jpg',
    eyebrow: '',
    title: '¡Conoce la variedad de los más de 2.500 productos!',
    description: 'Tenemos de todo para surtir tu tienda',
    button: 'Ver productos',
    href: '/products',
  },
  {
    image: 'slider5.jpg',
    eyebrow: 'El arte de tejer comienza con la calidad de nuestras',
    title: 'Lanas',
    description: 'Haz realidad tus grandes proyectos con variedad de colores',
    button: 'Todas las lanas',
    href: '/products?category=lanas',
  },
];

export default function HomeCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const changeSlide = (direction: number) =>
    setIndex((current) => (current + direction + slides.length) % slides.length);
  const slide = slides[index];
  const stopped = paused || reducedMotion;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (stopped || interacting || hidden) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearTimeout(timer);
  }, [index, stopped, interacting, hidden]);

  return (
    <section
      aria-label="Novedades de Rematico"
      aria-roledescription="carrusel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          changeSlide(-1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          changeSlide(1);
        }
      }}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onTouchStart={(event) => {
        touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const dx = start.x - event.changedTouches[0].clientX;
        const dy = start.y - event.changedTouches[0].clientY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) changeSlide(dx > 0 ? 1 : -1);
      }}
      className="relative overflow-hidden bg-[#fcf8ee] text-[#340d0d] outline-offset-4 md:min-h-[460px] lg:min-h-[550px]"
    >
      <div
        className="relative h-[150px] sm:h-[230px] md:absolute md:inset-0 md:h-full"
        aria-hidden="true"
      >
        {slides.map((item, slideIndex) => (
          <Image
            key={item.image}
            src={`/inicio-carrusel/${item.image}`}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${slideIndex === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <div className="relative z-10 mx-auto flex min-h-[320px] max-w-7xl items-center justify-center px-10 pb-16 pt-6 text-center sm:px-16 md:min-h-[460px] md:px-0 md:py-16 lg:min-h-[550px]">
        <div
          key={index}
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${index + 1} de ${slides.length}`}
          aria-live={stopped ? 'polite' : 'off'}
          className="w-full max-w-xl md:w-[44%] md:max-w-none"
          style={{ animation: 'fadeIn 350ms ease-out' }}
        >
          {slide.eyebrow && (
            <p
              className={
                index === 4
                  ? 'mb-4 text-base font-semibold leading-relaxed md:text-xl'
                  : 'mb-5 text-3xl font-black sm:text-4xl lg:text-5xl'
              }
            >
              {slide.eyebrow}
            </p>
          )}
          <h2
            className={
              index === 2 || index === 3
                ? 'text-2xl font-black leading-tight sm:text-3xl lg:text-4xl'
                : 'text-3xl font-black leading-tight sm:text-4xl lg:text-5xl'
            }
          >
            {slide.title}
          </h2>
          <p className="mx-auto mt-6 whitespace-pre-line text-sm leading-relaxed text-[#941c20] sm:text-base lg:text-lg">
            {slide.description}
          </p>
          <Link
            href={slide.href}
            target={slide.href.startsWith('https:') ? '_blank' : undefined}
            rel={slide.href.startsWith('https:') ? 'noopener noreferrer' : undefined}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-[#bc1736] px-8 py-3 text-sm font-semibold uppercase text-white transition hover:bg-[#99132d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bc1736]"
          >
            <ArrowRight size={17} />
            {slide.button}
          </Link>
        </div>
      </div>
      <button
        type="button"
        aria-label="Diapositiva anterior"
        onClick={() => changeSlide(-1)}
        className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#641620] shadow-sm hover:bg-white sm:left-5"
      >
        <ChevronLeft size={27} />
      </button>
      <button
        type="button"
        aria-label="Diapositiva siguiente"
        onClick={() => changeSlide(1)}
        className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#641620] shadow-sm hover:bg-white sm:right-5"
      >
        <ChevronRight size={27} />
      </button>
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full bg-white/85 px-2 py-1">
        <button
          type="button"
          aria-label={stopped ? 'Reproducir carrusel' : 'Pausar carrusel'}
          onClick={() => {
            if (stopped) {
              setReducedMotion(false);
              setPaused(false);
            } else setPaused(true);
          }}
          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-[#bc1736]"
        >
          {stopped ? (
            <Play size={14} fill="currentColor" />
          ) : (
            <Pause size={14} fill="currentColor" />
          )}
        </button>
        {slides.map((item, slideIndex) => (
          <button
            type="button"
            key={item.image}
            onClick={() => setIndex(slideIndex)}
            aria-label={`Mostrar diapositiva ${slideIndex + 1}: ${item.title}`}
            aria-current={index === slideIndex ? 'true' : undefined}
            className="flex h-8 w-7 items-center justify-center"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors ${index === slideIndex ? 'bg-[#bc1736]' : 'bg-gray-400 hover:bg-gray-600'}`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
