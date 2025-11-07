'use client'

/**
 * TrendingArtists - Carousel display of artworks with frame decoration
 * Features background with Obra3, title section, description panel, and framed artwork
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import { getPublicImageUrl } from '@/lib/supabase';
import { useColor } from '@/contexts/ColorContext';
import {
  Palette,
  User
} from 'lucide-react';

const TrendingArtists = () => {
  const router = useRouter();
  const [paintings, setPaintings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const { color } = useColor();
  

  // Cargar pinturas del backend
  useEffect(() => {
    const loadPaintings = async () => {
      setIsLoading(true);
      try {
        const response = await paintService.getAll();

        if (response.success) {
          const transformedPaintings = response.data.map(paint => ({
            id: paint.id,
            title: paint.nombre_pintura,
            artist: paint.artista,
            userId: paint.publicado_por, // ID del usuario que publicó la pintura
            description: paint.descripcion_pintura,
            category: paint.categoria,
            imageUrl: getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`,
            tags: paint.etiqueta ? paint.etiqueta.split(', ') : [],
          }));

          setPaintings(transformedPaintings);
        }
      } catch (error) {
        console.error('Error cargando pinturas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaintings();
  }, []);

  // Auto-play: avanzar automáticamente cada 3 segundos
  useEffect(() => {
    if (paintings.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === paintings.length - 1 ? 0 : prev + 1));
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(interval);
  }, [paintings.length]);

  // Funcionalidad de arrastrar (drag)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setScrollY(0);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setScrollY(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentY = e.clientY;
    const diff = startY - currentY;
    setScrollY(diff);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    setScrollY(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Si arrastraron hacia abajo (diff negativo), ir a slide anterior
    if (scrollY < -50) {
      setCurrentSlide((prev) => (prev === 0 ? paintings.length - 1 : prev - 1));
    }
    // Si arrastraron hacia arriba (diff positivo), ir a siguiente slide
    else if (scrollY > 50) {
      setCurrentSlide((prev) => (prev === paintings.length - 1 ? 0 : prev + 1));
    }

    setScrollY(0);
  };

  const goToArtwork = (artworkId) => {
    router.push(`/artwork/${artworkId}`);
  };

  const goToArtistProfile = (userId) => {
    if (!userId) {
      console.warn('No se puede navegar al perfil: userId no disponible');
      return;
    }
    router.push(`/user/${userId}`);
  };

  // Detectar dimensiones de la imagen cuando se carga
  const handleImageLoad = (e) => {
    const img = e.target;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  // Seleccionar el marco según las proporciones de la imagen
  const getFrameImage = () => {
    if (!imageDimensions.width || !imageDimensions.height) return '/cuadro6.PNG';

    const aspectRatio = imageDimensions.width / imageDimensions.height;

    // Horizontal (más ancha que alta)
    if (aspectRatio > 1.3) {
      return '/cuadro5.png';  // cuadro3 para imágenes horizontales
    }
    // Vertical (más alta que ancha)
    else if (aspectRatio < 0.8) {
      return '/cuadro6.png';  // cuadro2 para imágenes verticales
    }
    // Cuadrada o casi cuadrada (vertical)
    else {
      return '/cuadro6.PNG';  // cuadro para imágenes cuadradas/verticales
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-screen flex items-center justify-center bg-slate-100" style={{ backgroundColor: 'var(--dark-bg, rgb(241 245 249))' }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-nature-200 dark:border-nature-800 border-t-nature-600 dark:border-t-nature-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Cargando obras de arte...</p>
        </div>
      </section>
    );
  }

  if (paintings.length === 0) {
    return (
      <section className="relative w-full h-screen flex items-center justify-center bg-slate-100" style={{ backgroundColor: 'var(--dark-bg, rgb(241 245 249))' }}>
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300 text-lg">No hay obras disponibles</p>
        </div>
      </section>
    );
  }

  const currentArtwork = paintings[currentSlide];

  return (
    <section className="relative w-full h-screen">
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-animation {
          animation: slideUp 1.2s ease-out;
        }
        @keyframes slideIndicator {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(5px);
          }
        }
        .animate-slide-indicator {
          animation: slideIndicator 2s ease-in-out infinite;
        }

        :global(.dark) section {
          --dark-bg: #0a0a0a;
          --section-bg: #0a0a0a;
        }
      `}</style>

      {/* Sección Superior (20% - Fondo con Obra3 + Título) */}
      <div
        className="relative h-[20vh] w-full bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Obra9.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Título de la pintura */}
        <h1 key={currentSlide} className="relative z-10 text-4xl md:text-6xl font-display font-bold text-white drop-shadow-2xl px-4 text-center slide-animation">
          {currentArtwork.title}
        </h1>
      </div>

      {/* Sección Inferior (80% - Descripción + Marco con Pintura + Botones) */}
      <div
        className="relative h-[80vh] w-full bg-gradient-to-br from-slate-100 via-white to-slate-50 cursor-grab active:cursor-grabbing overflow-hidden"
        style={{
          background: 'var(--section-bg, linear-gradient(to bottom right, rgb(241 245 249), rgb(255 255 255), rgb(248 250 252)))'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">

          {/* Contenido Central */}
          <div key={currentSlide} className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center slide-animation">

            {/* Panel Izquierdo - Descripción y Botones */}
            <div className="flex flex-col justify-center space-y-6 h-full">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {artCategories.find(cat => cat.id === currentArtwork.category)?.name || currentArtwork.category}
                </Badge>

                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {currentArtwork.title}
                </h2>

                <div className="flex items-center gap-3 text-xl text-slate-600 dark:text-slate-300">
                  <User className="h-6 w-6" />
                  <span className="font-semibold">{currentArtwork.artist}</span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  {currentArtwork.description}
                </p>
              </div>

              {/* Etiquetas */}
              {currentArtwork.tags && currentArtwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentArtwork.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => goToArtwork(currentArtwork.id)}
                  className="inline-flex items-center gap-2 rounded-lg px-8 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                  style={{ background: color }}
                >
                  <Palette className="h-5 w-5" />
                  Ver pintura
                </button>

                <button
                  onClick={() => goToArtistProfile(currentArtwork.userId)}
                  disabled={!currentArtwork.userId}
                  className="inline-flex items-center gap-2 rounded-lg px-8 py-3 text-base font-medium bg-transparent border-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  style={{
                    borderColor: color,
                    color: color
                  }}
                  onMouseEnter={(e) => {
                    if (!currentArtwork.userId) return;
                    e.currentTarget.style.background = color;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = color;
                  }}
                >
                  <User className="h-5 w-5" />
                  Artista
                </button>
              </div>
            </div>

            {/* Panel Derecho - Marco con Imagen */}
            <div className="flex items-center justify-center h-full w-full px-7 pl-7 relative">
              <div className="relative inline-flex items-center justify-center">
                {/* Wrapper que define el tamaño basado en la imagen con espacio para el marco */}
                <div className="relative p-[12%]">
                  {/* Imagen de la pintura */}
                  <img
                    ref={imageRef}
                    src={currentArtwork.imageUrl}
                    alt={currentArtwork.title}
                    onLoad={handleImageLoad}
                    className="block max-h-[55vh] w-auto"
                  />

                  {/* Marco decorativo que se posiciona alrededor */}
                  <div className="absolute inset-0 -m-[12%]">
                    <img
                      src={getFrameImage()}
                      alt="Marco decorativo"
                      className="w-full h-full object-fill pointer-events-none drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Indicadores de progreso - vertical a la derecha */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-3">
                {paintings.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-3 h-8 animate-slide-indicator'
                        : 'bg-slate-300 dark:bg-slate-600 w-3 h-3 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                    style={index === currentSlide ? { background: color } : {}}
                    aria-label={`Ir a obra ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingArtists;
