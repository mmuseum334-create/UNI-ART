'use client'

import { useState, useEffect, useRef } from 'react';
import ARViewer from '@/components/ar/ARViewer';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { useColor } from '@/contexts/ColorContext';
import {
  Box,
  Smartphone,
  AlertTriangle,
  Move3d,
  ScanLine,
  Loader2,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Tag,
  User,
  Layers,
} from 'lucide-react';

let modelViewerLoaded = false;
const loadModelViewer = () => {
  if (typeof window === 'undefined' || modelViewerLoaded) return Promise.resolve();
  if (customElements.get('model-viewer')) { modelViewerLoaded = true; return Promise.resolve(); }
  return import('@google/model-viewer').then(() => { modelViewerLoaded = true; });
};

const AR = () => {
  const { color } = useColor();
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerReady, setViewerReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelVisible, setModelVisible] = useState(false);
  const [error, setError] = useState(null);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(setIsARSupported)
        .catch(() => setIsARSupported(false));
    }
  }, []);

  useEffect(() => {
    loadModelViewer().then(() => setViewerReady(true));
  }, []);

  useEffect(() => {
    sculptureService.getAll().then((result) => {
      if (result.success) {
        const arReady = (result.data || []).filter(
          (s) => s.estado_procesamiento === 'completado' && s.modelo_3d_url
        );
        setArtworks(arReady);
        if (arReady.length > 0) setFeatured(arReady[0]);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (featured) {
      setModelLoading(true);
      setModelVisible(false);
    }
  }, [featured]);

  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv || !viewerReady) return;
    const onLoad = () => {
      setModelLoading(false);
      // Small delay for smooth fade-in
      requestAnimationFrame(() => setTimeout(() => setModelVisible(true), 50));
    };
    const onError = () => { setModelLoading(false); setModelVisible(true); };
    mv.addEventListener('load', onLoad);
    mv.addEventListener('error', onError);
    return () => {
      mv.removeEventListener('load', onLoad);
      mv.removeEventListener('error', onError);
    };
  }, [viewerReady, featured]);

  const normalize = (s) => ({
    id: s.id,
    title: s.nombre_escultura,
    artist: s.artista,
    description: s.descripcion_escultura,
    modelUrl: s.modelo_3d_url,
    thumbnail: Array.isArray(s.imagenes) && s.imagenes.length > 0 ? s.imagenes[0] : null,
    category: s.categoria,
    tags: s.etiqueta ? [s.etiqueta] : [],
  });

  const startAR = () => {
    if (!featured) return;
    setSelectedArtwork(normalize(featured));
    setIsARActive(true);
  };

  const stopAR = () => {
    setIsARActive(false);
    setSelectedArtwork(null);
  };

  /* ── loading inicial ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" strokeWidth="2" stroke="currentColor" strokeOpacity="0.1" className="text-gray-400" />
              <circle cx="28" cy="28" r="24" fill="none" strokeWidth="2" strokeDasharray="60 90" strokeLinecap="round"
                style={{ stroke: color }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Box className="w-5 h-5" style={{ color }} />
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[11px] tracking-[0.2em] uppercase font-medium">
            Preparando experiencia AR
          </p>
        </div>
      </div>
    );
  }

  if (isARActive && selectedArtwork) {
    return <ARViewer artwork={selectedArtwork} onExit={stopAR} />;
  }

  const norm = featured ? normalize(featured) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-primary flex flex-col mt-14">

      {/* ══ HERO HEADER ══ */}
      <header className="bg-gray-50 dark:bg-[#0e0e0e] border-b border-gray-200 dark:border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3
                bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-dark-tertiary">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                Realidad Aumentada · WebXR
                <ScanLine className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-white">
                Esculturas en{' '}
                <span style={{ color }}>tu mundo real</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-md">
                Explora modelos 3D en el navegador. En tu móvil, colócalos en tu espacio real con Realidad Aumentada.
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* ══ ALERTA AR ══ */}
      {!isARSupported && (
        <div className="bg-amber-50 dark:bg-dark-tertiary border-b border-amber-200 dark:border-dark-tertiary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-gray-400">
              <span className="font-semibold text-amber-800 dark:text-gray-300">Estás en escritorio</span>
              {' '}— puedes explorar los modelos 3D aquí. Para AR, abre esta página desde Android con Chrome.
            </p>
          </div>
        </div>
      )}

      {/* ══ ERROR / VACÍO ══ */}
      {error && (
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      )}

      {!error && artworks.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center mb-5">
            <Box className="w-9 h-9 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Sin obras listas para AR</h3>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Las esculturas aparecen aquí cuando su modelo 3D ha sido generado por Meshy AI.
          </p>
        </div>
      )}

      {/* ══ VISOR PRINCIPAL MEJORADO ══ */}
      {!error && artworks.length > 0 && norm && (
        <main className="flex-1 flex flex-col">

          {/*
            ─────────────────────────────────────────────────
            VISOR 3D + INFO PANEL
            Layout:
              Mobile  → visor pantalla completa con info en bottom sheet
              Desktop → visor flex-1 | panel lateral fijo
            ─────────────────────────────────────────────────
          */}
          <div className="flex flex-col lg:flex-row border-b border-gray-200 dark:border-dark-tertiary">

            {/* ── Visor 3D ── */}
            <div className="relative w-full lg:flex-1 h-[300px] lg:h-auto lg:min-h-[520px]">

              {/* Model viewer con fade-in al cargar */}
              {viewerReady && (
                <model-viewer
                  ref={modelViewerRef}
                  key={norm.id}
                  src={norm.modelUrl}
                  alt={norm.title}
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="600"
                  rotation-per-second="18deg"
                  shadow-intensity="1.4"
                  shadow-softness="0.6"
                  exposure="1.15"
                  environment-image="neutral"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-scale="auto"
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    inset: 0,
                    opacity: modelVisible ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    backgroundColor: 'transparent',
                  }}
                >
                  {/* Botón AR nativo (solo aparece en dispositivos compatibles) */}
                  <button
                    slot="ar-button"
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '16px',
                      padding: '11px 20px',
                      backgroundColor: color,
                      border: 'none',
                      borderRadius: '50px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: `0 8px 24px ${color}55`,
                      letterSpacing: '0.01em',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    Ver en AR
                  </button>
                </model-viewer>
              )}

              {/* Fondo del visor */}
              <div className="absolute inset-0 bg-gray-100 dark:bg-dark-secondary -z-10" />

              {/* ── Loading state mejorado ── */}
              {(modelLoading || !viewerReady) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-secondary z-20">
                  {/* Grid de puntos de fondo */}
                  <div className="absolute inset-0 opacity-30 dark:opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle, ${color}33 1px, transparent 1px)`,
                      backgroundSize: '28px 28px',
                    }}
                  />
                  <div className="relative flex flex-col items-center gap-4">
                    {/* Spinner custom */}
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 animate-spin" style={{ animationDuration: '1.4s' }} viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="2"
                          stroke="currentColor" strokeOpacity="0.1" className="text-gray-500" />
                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="2.5"
                          strokeDasharray="50 126" strokeLinecap="round"
                          style={{ stroke: color }} />
                      </svg>
                      {/* Icono central */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}>
                          <Box className="w-4 h-4" style={{ color }} />
                        </div>
                      </div>
                    </div>
                    {/* Nombre de la obra */}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                        Cargando modelo
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{norm.title}</p>
                    </div>
                    {/* Barra de progreso animada */}
                    <div className="w-32 h-0.5 rounded-full bg-gray-200 dark:bg-dark-tertiary overflow-hidden">
                      <div className="h-full rounded-full animate-pulse"
                        style={{ backgroundColor: color, width: '60%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Badge AR disponible (top-left) ── */}
              {isARSupported && modelVisible && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold backdrop-blur-sm"
                    style={{ backgroundColor: `${color}e0`, boxShadow: `0 4px 12px ${color}44` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    AR listo
                  </div>
                </div>
              )}

              {/* ── Controles hint (bottom-left) ── */}
              {modelVisible && (
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-md
                    px-2.5 py-1.5 rounded-full text-xs text-gray-600 dark:text-white/70
                    border border-white/50 dark:border-white/10 shadow-sm">
                    <Move3d className="w-3 h-3" />
                    <span>Arrastra · Pellizca</span>
                  </div>
                </div>
              )}

            </div>

            {/* ── MOBILE: info debajo del visor (no superpuesta) ── */}
            <div className="lg:hidden bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-dark-tertiary px-4 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5">Explorando</p>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight">
                    {norm.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{norm.artist}</p>
                </div>
                {norm.tags.length > 0 && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-gray-400 mt-0.5">
                    #{norm.tags[0]}
                  </span>
                )}
              </div>
              {norm.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
                  {norm.description}
                </p>
              )}
              <button
                onClick={startAR}
                disabled={!isARSupported}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                  transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: color,
                  boxShadow: isARSupported ? `0 6px 20px ${color}44` : 'none',
                }}
              >
                <Smartphone className="w-4 h-4" />
                {isARSupported ? 'Colocar en tu espacio (AR)' : 'AR requiere móvil Android'}
              </button>
            </div>

            {/* ── Panel de información (desktop only) ── */}
            <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col bg-white dark:bg-dark-secondary
              border-l border-gray-200 dark:border-dark-tertiary overflow-hidden">

              {/* Zona scrollable: info de la obra */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* Cabecera */}
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400 dark:text-gray-500 mb-3">
                  Explorando ahora
                </p>

                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">
                  {norm.title}
                </h2>

                {/* Artista */}
                <div className="flex items-center gap-1.5 mb-4">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{norm.artist}</p>
                </div>

                {/* Separador decorativo */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-dark-tertiary" />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <div className="flex-1 h-px bg-gray-100 dark:bg-dark-tertiary" />
                </div>

                {/* Descripción */}
                {norm.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                    {norm.description}
                  </p>
                )}

                {/* Metadatos */}
                <div className="space-y-2 mb-5">
                  {norm.category && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Layers className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
                      <span>{norm.category}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {norm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {norm.tags.slice(0, 5).map((tag, i) => (
                      <span key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                          bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-gray-400 font-medium">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── CTA fijo abajo ── */}
              <div className="p-5 border-t border-gray-100 dark:border-dark-tertiary bg-white dark:bg-dark-secondary">

                {/* Instrucción contextual */}
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3 leading-relaxed">
                  {isARSupported
                    ? 'Toca el botón para superponer la escultura en tu entorno real.'
                    : 'Abre esta página en Android Chrome para activar la Realidad Aumentada.'}
                </p>

                <button
                  onClick={startAR}
                  disabled={!isARSupported}
                  className="group w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white
                    flex items-center justify-center gap-2.5
                    transition-all duration-200
                    hover:opacity-90 hover:scale-[1.01]
                    active:scale-[0.98]
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    backgroundColor: color,
                    boxShadow: isARSupported ? `0 8px 24px ${color}44` : 'none',
                  }}
                >
                  <Smartphone className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  {isARSupported ? 'Colocar en tu espacio (AR)' : 'AR requiere móvil'}
                  {isARSupported && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>

                {/* Hint de modelo interactivo en PC */}
                {!isARSupported && (
                  <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
                    El modelo 3D de arriba es interactivo aquí en PC
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ══ GRID DE OBRAS ══ */}
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest">
                Obras disponibles
                <span className="ml-2 font-normal text-gray-400 normal-case tracking-normal">
                  ({artworks.length})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {artworks.map((sculpture) => {
                const n = normalize(sculpture);
                const isActive = featured?.id === sculpture.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setFeatured(sculpture)}
                    className="group text-left rounded-xl overflow-hidden transition-all duration-200 focus:outline-none
                      bg-white dark:bg-dark-secondary
                      hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      border: `2px solid ${isActive ? color : 'transparent'}`,
                      outline: isActive ? `1px solid ${color}55` : 'none',
                      outlineOffset: '1px',
                    }}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-dark-tertiary overflow-hidden relative">
                      {viewerReady ? (
                        <model-viewer
                          key={n.id}
                          data-card-viewer={n.id}
                          src={n.modelUrl}
                          alt={n.title}
                          poster={n.thumbnail || undefined}
                          auto-rotate={isActive ? '' : undefined}
                          auto-rotate-delay={isActive ? '0' : undefined}
                          rotation-per-second={isActive ? '25deg' : undefined}
                          interaction-prompt="none"
                          loading="lazy"
                          shadow-intensity="0.8"
                          exposure="1"
                          style={{ width: '100%', height: '100%', backgroundColor: 'transparent', pointerEvents: 'none' }}
                        />
                      ) : n.thumbnail ? (
                        <img src={n.thumbnail} alt={n.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-200 pointer-events-none" />
                    </div>

                    <div className="px-2.5 py-2">
                      <p className="text-xs font-semibold text-gray-800 dark:text-white truncate leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{n.artist}</p>
                    </div>

                    {/* Barra activa */}
                    {isActive && (
                      <div className="h-0.5 w-full transition-all" style={{ backgroundColor: color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ══ CÓMO FUNCIONA ══ */}
      <footer className="border-t border-gray-200 dark:border-dark-tertiary bg-gray-50 dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">
            ¿Cómo funciona la experiencia AR?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { n: '01', title: 'Explora en 3D', desc: 'En cualquier dispositivo puedes rotar y hacer zoom al modelo 3D desde el navegador.' },
              { n: '02', title: 'Abre en móvil', desc: 'En Android con ARCore activo, aparece el botón "Ver en AR" sobre el modelo.' },
              { n: '03', title: 'Colócalo en tu espacio', desc: 'Apunta tu cámara al suelo y la escultura aparecerá en tu entorno real a escala.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: color }}>
                  {n}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AR;