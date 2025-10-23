/**
 * AR page - Augmented Reality experience for viewing 3D artworks
 * Uses WebXR API to display artworks in AR on compatible devices
 */
'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import ARViewer from '@/components/ar/ARViewer';
import { arModels } from '@/data/arModels';
import {
  Box,
  Play,
  Square,
  RotateCcw,
  Maximize,
  Info,
  Smartphone,
  Chrome,
  AlertTriangle,
  Sparkles,
  Eye,
  Heart,
  Palette,
  Layers
} from 'lucide-react';

const AR = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Verificar soporte para WebXR
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported);
        } catch (error) {
          console.log('AR no soportado:', error);
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
      }
      setIsLoading(false);
    };

    checkARSupport();
  }, []);

  // Usar los modelos configurados en arModels.js
  const arArtworks = arModels;

  // Filtrar por categoría
  const filteredArtworks = selectedCategory === 'all'
    ? arArtworks
    : arArtworks.filter(artwork => artwork.category === selectedCategory);

  // Categorías disponibles
  const categories = [
    { id: 'all', name: 'Todas', icon: Box },
    { id: 'paintings', name: 'Pinturas', count: arArtworks.filter(a => a.category === 'paintings').length },
    { id: 'sculptures', name: 'Esculturas', count: arArtworks.filter(a => a.category === 'sculptures').length },
    { id: 'other', name: 'Otros', count: arArtworks.filter(a => a.category === 'other').length }
  ];

  const startARSession = (artwork) => {
    setSelectedArtwork(artwork);
    setIsARActive(true);
  };

  const stopARSession = () => {
    setIsARActive(false);
    setSelectedArtwork(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-nature-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary flex items-center justify-center">
        <div className="text-center">
          {/* Spinner mejorado */}
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-nature-200 dark:border-nature-800 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-nature-600 dark:border-nature-400 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <Box className="h-12 w-12 text-nature-600 dark:text-nature-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Inicializando AR
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">Verificando compatibilidad del dispositivo...</p>
        </div>
      </div>
    );
  }

  if (isARActive && selectedArtwork) {
    return (
      <div className="min-h-screen">
        <ARViewer
          artwork={selectedArtwork}
          onExit={stopARSession}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-nature-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary relative overflow-hidden">
      {/* Fondo con patrón de grid futurista */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-20"></div>

        {/* Elementos decorativos AR */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Burbujas animadas grandes */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-museum-300 dark:bg-museum-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-nature-300 dark:bg-nature-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-museum-400 dark:bg-museum-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

          {/* Marcos/Cuadros flotantes decorativos */}
          <div className="absolute top-20 left-10 w-32 h-40 border-4 border-museum-400/30 dark:border-museum-500/30 rounded-lg rotate-12 animate-float"></div>
          <div className="absolute top-40 right-20 w-40 h-32 border-4 border-nature-400/30 dark:border-nature-500/30 rounded-lg -rotate-6 animate-float animation-delay-2000"></div>
          <div className="absolute bottom-32 left-1/4 w-28 h-36 border-4 border-museum-300/30 dark:border-museum-600/30 rounded-lg rotate-6 animate-float animation-delay-4000"></div>
          <div className="absolute bottom-40 right-1/4 w-36 h-28 border-4 border-nature-300/30 dark:border-nature-600/30 rounded-lg -rotate-12 animate-float animation-delay-1000"></div>

          {/* Iconos 3D flotantes */}
          <div className="absolute top-1/4 right-1/3 opacity-20 dark:opacity-10 animate-float-slow">
            <Box className="h-16 w-16 text-museum-500 dark:text-museum-400" />
          </div>
          <div className="absolute bottom-1/3 left-1/4 opacity-20 dark:opacity-10 animate-float-slow animation-delay-2000">
            <Layers className="h-12 w-12 text-nature-500 dark:text-nature-400" />
          </div>
          <div className="absolute top-1/3 left-1/2 opacity-15 dark:opacity-10 animate-float-slow animation-delay-3000">
            <Sparkles className="h-14 w-14 text-museum-400 dark:text-museum-500" />
          </div>

          {/* Puntos de conexión AR */}
          <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" style={{ pointerEvents: 'none' }}>
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Líneas conectoras simulando AR tracking */}
            <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
            <line x1="70%" y1="30%" x2="85%" y2="50%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '1s' }} />
            <line x1="20%" y1="70%" x2="40%" y2="85%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '2s' }} />
            <line x1="60%" y1="60%" x2="80%" y2="75%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '0.5s' }} />

            {/* Puntos de tracking AR */}
            <circle cx="10%" cy="20%" r="4" fill="rgb(34, 197, 94)" opacity="0.6" className="animate-ping" />
            <circle cx="30%" cy="40%" r="4" fill="rgb(14, 165, 233)" opacity="0.6" className="animate-ping" style={{ animationDelay: '0.5s' }} />
            <circle cx="70%" cy="30%" r="4" fill="rgb(34, 197, 94)" opacity="0.6" className="animate-ping" style={{ animationDelay: '1s' }} />
            <circle cx="85%" cy="50%" r="4" fill="rgb(14, 165, 233)" opacity="0.6" className="animate-ping" style={{ animationDelay: '1.5s' }} />
            <circle cx="20%" cy="70%" r="4" fill="rgb(34, 197, 94)" opacity="0.6" className="animate-ping" style={{ animationDelay: '2s' }} />
            <circle cx="60%" cy="60%" r="4" fill="rgb(14, 165, 233)" opacity="0.6" className="animate-ping" style={{ animationDelay: '2.5s' }} />
          </svg>

          {/* Partículas pequeñas */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-nature-400 rounded-full animate-ping opacity-40"></div>
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-museum-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-nature-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-museum-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Hero Header con diseño mejorado */}
      <section className="relative">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="text-center mb-12">
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-lg mb-6 border border-nature-200 dark:border-nature-700">
              <Sparkles className="h-5 w-5 text-nature-600 dark:text-nature-400 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-museum-600 to-nature-600 dark:from-museum-400 dark:to-nature-400 bg-clip-text text-transparent">
                Realidad Aumentada WebXR
              </span>
              <Box className="h-5 w-5 text-museum-600 dark:text-museum-400 animate-spin-slow" />
            </div>

            {/* Título principal con gradiente mejorado */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-museum-600 via-nature-600 to-museum-700 dark:from-museum-400 dark:via-nature-400 dark:to-museum-300 bg-clip-text text-transparent">
                Experimenta el Arte
              </span>
              <span className="block bg-gradient-to-r from-nature-600 via-museum-600 to-nature-700 dark:from-nature-400 dark:via-museum-400 dark:to-nature-300 bg-clip-text text-transparent">
                en Tu Realidad
              </span>
            </h1>

            {/* Descripción mejorada */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transforma tu espacio con arte tridimensional. Visualiza esculturas, pinturas y obras digitales
              como si estuvieran frente a ti. <span className="font-semibold text-nature-600 dark:text-nature-400">La magia de la tecnología WebXR</span> al alcance de tu mano.
            </p>

            {/* Stats rápidos */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-nature-100 dark:border-nature-800">
                <Layers className="h-5 w-5 text-nature-600 dark:text-nature-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{arModels.length} Obras en 3D</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-museum-100 dark:border-museum-800">
                <Palette className="h-5 w-5 text-museum-600 dark:text-museum-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Vista 360°</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-nature-100 dark:border-nature-800">
                <Eye className="h-5 w-5 text-nature-600 dark:text-nature-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Experiencia Inmersiva</span>
              </div>
            </div>

            {!isARSupported && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    AR No Disponible
                  </h3>
                </div>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  La Realidad Aumentada no está disponible. Para usarla necesitas:
                </p>
                <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                  <div className="flex items-start text-amber-700 dark:text-amber-300">
                    <Smartphone className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Dispositivo Android</strong> con ARCore instalado</span>
                  </div>
                  <div className="flex items-start text-amber-700 dark:text-amber-300">
                    <Chrome className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Navegador Chrome</strong> para Android actualizado</span>
                  </div>
                  <div className="flex items-start text-amber-700 dark:text-amber-300">
                    <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Conexión HTTPS</strong> (usa ngrok o despliega en producción)</span>
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                  💡 Si estás en desarrollo local, usa ngrok o accede vía HTTPS para que funcione la cámara
                </p>
              </div>
            )}
          </div>

          {/* Filtros modernos con pills */}
          <div className="mb-12">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Explora por Categoría
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => {
                  const isActive = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105
                        ${isActive
                          ? 'bg-gradient-to-r from-nature-600 to-museum-600 text-white shadow-lg shadow-nature-500/50'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border-2 border-nature-200 dark:border-nature-700'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {category.name}
                        {category.count !== undefined && (
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-bold
                            ${isActive ? 'bg-white/30' : 'bg-nature-100 dark:bg-nature-900 text-nature-700 dark:text-nature-300'}
                          `}>
                            {category.count}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-nature-600 to-museum-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contador con animación */}
              <div className="text-center mt-4 px-6 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-nature-100 dark:border-nature-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="inline h-4 w-4 mr-2 text-nature-600 dark:text-nature-400" />
                  Mostrando <span className="text-nature-600 dark:text-nature-400 text-lg font-bold">{filteredArtworks.length}</span> {filteredArtworks.length === 1 ? 'obra' : 'obras'} en AR
                </p>
              </div>
            </div>
          </div>

          {/* Artworks Grid - Diseño Premium */}
          {filteredArtworks.length === 0 ? (
            /* Estado vacío con diseño atractivo */
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-nature-100 to-museum-100 dark:from-nature-900/30 dark:to-museum-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Box className="h-16 w-16 text-nature-400 dark:text-nature-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  No hay obras en esta categoría
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Prueba seleccionando otra categoría para ver más contenido en AR
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 bg-gradient-to-r from-nature-600 to-museum-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Ver Todas las Obras
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Imagen con overlay gradiente */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.thumbnail}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradiente overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Badge de categoría flotante */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2 bg-gradient-to-r from-nature-500/90 to-museum-500/90 text-white text-sm font-semibold">
                      {artwork.category === 'paintings' ? (
                        <>
                          <Palette className="h-4 w-4" />
                          <span>Pintura</span>
                        </>
                      ) : artwork.category === 'sculptures' ? (
                        <>
                          <Box className="h-4 w-4" />
                          <span>Escultura</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Digital</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Icono AR flotante */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <Box className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Overlay de hover con info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-nature-600/95 via-museum-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg border-2 border-white/40 flex items-center justify-center mb-4 animate-bounce-slow">
                        <Play className="h-10 w-10 text-white" style={{ marginLeft: '3px' }} />
                      </div>
                      <p className="text-white font-bold text-lg text-center mb-2">Vista AR Disponible</p>
                      <p className="text-white/90 text-sm text-center">Toca para experimentar en 3D</p>
                    </div>
                  </div>

                  {/* Título en la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">{artwork.title}</h3>
                    <p className="text-white/90 text-sm drop-shadow-md flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      {artwork.artist}
                    </p>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6">
                  {/* Descripción */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
                    {artwork.description}
                  </p>

                  {/* Tags con diseño mejorado */}
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {artwork.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-nature-100 to-museum-100 dark:from-nature-900/50 dark:to-museum-900/50 text-nature-700 dark:text-nature-300 border border-nature-200 dark:border-nature-700"
                        >
                          #{tag}
                        </span>
                      ))}
                      {artwork.tags.length > 3 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          +{artwork.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => startARSession(artwork)}
                      disabled={!isARSupported}
                      className={`
                        flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
                        ${isARSupported
                          ? 'bg-gradient-to-r from-nature-600 to-museum-600 hover:from-nature-700 hover:to-museum-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Play className="h-5 w-5" />
                      <span>{isARSupported ? 'Iniciar AR' : 'No Disponible'}</span>
                    </button>

                    <button className="w-12 h-12 rounded-xl border-2 border-nature-200 dark:border-nature-700 hover:border-nature-400 dark:hover:border-nature-500 hover:bg-nature-50 dark:hover:bg-nature-900/30 transition-all duration-300 flex items-center justify-center group/btn">
                      <Info className="h-5 w-5 text-nature-600 dark:text-nature-400 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Borde decorativo con gradiente */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-nature-400 dark:group-hover:border-nature-600 transition-all duration-300 pointer-events-none"></div>
              </div>
              ))}
            </div>
          )}

          {/* Instructions - Diseño mejorado */}
          <div className="mt-20 mb-12">
            <div className="max-w-5xl mx-auto">
              {/* Título de sección */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  ¿Cómo Funciona?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Experimenta el arte en 3 simples pasos
                </p>
              </div>

              {/* Steps con diseño moderno */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-nature-100 dark:border-nature-800">
                    {/* Número del paso */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-nature-600 to-museum-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      1
                    </div>

                    {/* Icono */}
                    <div className="w-16 h-16 bg-gradient-to-br from-nature-100 to-museum-100 dark:from-nature-900/50 dark:to-museum-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Smartphone className="h-8 w-8 text-nature-600 dark:text-nature-400" />
                    </div>

                    {/* Contenido */}
                    <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-white text-center">
                      Prepara tu Dispositivo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      Usa un dispositivo Android con ARCore y Chrome actualizado para la mejor experiencia.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-nature-100 dark:border-nature-800">
                    {/* Número del paso */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-nature-600 to-museum-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      2
                    </div>

                    {/* Icono */}
                    <div className="w-16 h-16 bg-gradient-to-br from-nature-100 to-museum-100 dark:from-nature-900/50 dark:to-museum-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-8 w-8 text-nature-600 dark:text-nature-400" />
                    </div>

                    {/* Contenido */}
                    <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-white text-center">
                      Inicia la Experiencia
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      Selecciona tu obra favorita y toca el botón &quot;Iniciar AR&quot; para comenzar la magia.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-nature-100 dark:border-nature-800">
                    {/* Número del paso */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-nature-600 to-museum-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      3
                    </div>

                    {/* Icono */}
                    <div className="w-16 h-16 bg-gradient-to-br from-nature-100 to-museum-100 dark:from-nature-900/50 dark:to-museum-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Box className="h-8 w-8 text-nature-600 dark:text-nature-400" />
                    </div>

                    {/* Contenido */}
                    <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-white text-center">
                      Explora e Interactúa
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      Mueve tu dispositivo para ver la obra desde todos los ángulos. ¡Rota, acércate, explora!
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA final */}
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nature-600 to-museum-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Sparkles className="h-5 w-5" />
                  <span>¡Comienza tu Experiencia AR Ahora!</span>
                  <Play className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estilos CSS personalizados */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(var(--rotate-start, 0deg));
          }
          50% {
            transform: translateY(-20px) translateX(10px) rotate(var(--rotate-end, 0deg));
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* Patrón de grid futurista */
        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: center center;
        }

        /* Mejora para line-clamp en navegadores antiguos */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default AR;