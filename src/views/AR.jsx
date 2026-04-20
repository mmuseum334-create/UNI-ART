'use client'

import { useState, useEffect, useRef } from 'react';
import ARViewer from '@/components/ar/ARViewer';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { useColor } from '@/contexts/ColorContext';
import {
  Box,
  Play,
  Smartphone,
  AlertTriangle,
  Sparkles,
  Move3d,
  ScanLine,
  Loader2,
} from 'lucide-react';

/* ─── carga model-viewer una sola vez ─── */
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
  const [error, setError] = useState(null);
  const modelViewerRef = useRef(null);

  /* ─── detectar soporte AR ─── */
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(setIsARSupported)
        .catch(() => setIsARSupported(false));
    }
  }, []);

  /* ─── cargar model-viewer ─── */
  useEffect(() => {
    loadModelViewer().then(() => setViewerReady(true));
  }, []);

  /* ─── cargar obras AR desde backend ─── */
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

  /* ─── resetear loading cuando cambia el modelo ─── */
  useEffect(() => {
    if (featured) setModelLoading(true);
  }, [featured]);

  /* ─── resetear posición de los viewers de tarjetas no activas ─── */
  useEffect(() => {
    const viewers = document.querySelectorAll('[data-card-viewer]');
    viewers.forEach((v) => {
      if (v.dataset.cardViewer !== String(featured?.id)) {
        v.resetTurntableRotation?.();
        v.cameraOrbit = 'auto auto auto';
      }
    });
  }, [featured]);

  /* ─── eventos del model-viewer ─── */
  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv || !viewerReady) return;
    const onLoad = () => setModelLoading(false);
    const onError = () => setModelLoading(false);
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

  /* ── pantalla de carga inicial ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <Loader2 className="w-16 h-16 animate-spin text-gray-300 dark:text-gray-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Box className="w-7 h-7" style={{ color }} />
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs tracking-widest uppercase">Preparando experiencia AR</p>
        </div>
      </div>
    );
  }

  /* ── visor AR pantalla completa ── */
  if (isARActive && selectedArtwork) {
    return <ARViewer artwork={selectedArtwork} onExit={stopAR} />;
  }

  const norm = featured ? normalize(featured) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-primary flex flex-col">

      {/* ══ HERO HEADER ══ */}
      <header className="bg-gray-50 dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-dark-tertiary">
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

            {/* Stats */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Obras en 3D', value: artworks.length, icon: Box },
                { label: 'Vista 360°', value: '∞', icon: Move3d },
                { label: 'AR en móvil', value: isARSupported ? 'Listo' : 'Móvil req.', icon: Smartphone },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-dark-tertiary">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white leading-none text-sm">{value}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ══ ALERTA AR ══ */}
      {!isARSupported && (
        <div className="bg-amber-50 dark:bg-dark-tertiary border-b border-amber-200 dark:border-dark-tertiary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-gray-400">
              <span className="font-semibold text-amber-800 dark:text-gray-300">Estás en escritorio</span> — puedes explorar los modelos 3D aquí.
              Para la experiencia en Realidad Aumentada, abre esta página desde un Android con Chrome.
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

      {/* ══ VISOR PRINCIPAL ══ */}
      {!error && artworks.length > 0 && norm && (
        <main className="flex-1 flex flex-col">

          {/* ── Fila superior: visor 3D + info ── */}
          <div className="flex flex-col lg:flex-row border-b border-gray-200 dark:border-dark-tertiary" style={{ height: '540px' }}>

            {/* Visor 3D */}
            <div className="relative flex-1 bg-gray-100 dark:bg-dark-secondary overflow-hidden">
              {viewerReady && (
                <model-viewer
                  ref={modelViewerRef}
                  key={norm.id}
                  src={norm.modelUrl}
                  alt={norm.title}
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="500"
                  rotation-per-second="20deg"
                  shadow-intensity="1.2"
                  shadow-softness="0.5"
                  exposure="1.1"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-scale="auto"
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                >
                  <button
                    slot="ar-button"
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '10px 22px',
                      backgroundColor: color,
                      border: 'none',
                      borderRadius: '50px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: `0 6px 20px ${color}55`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    Ver en AR
                  </button>
                </model-viewer>
              )}

              {/* Spinner */}
              {(modelLoading || !viewerReady) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-secondary z-10">
                  <div className="relative w-12 h-12 mb-3">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-300 dark:text-gray-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Box className="w-5 h-5" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-gray-400 dark:text-gray-600 text-xs tracking-widest">CARGANDO MODELO 3D</p>
                </div>
              )}

              {/* Hints */}
              {!modelLoading && viewerReady && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                  <div className="flex items-center gap-1 bg-white/80 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-gray-600 dark:text-white/70 text-xs border border-gray-200/50 dark:border-transparent">
                    <Move3d className="w-3 h-3" />
                    Arrastra · Zoom
                  </div>
                </div>
              )}

              {/* Badge AR */}
              {isARSupported && !modelLoading && (
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                    style={{ backgroundColor: `${color}dd` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    AR disponible
                  </div>
                </div>
              )}
            </div>

            {/* Info de la obra seleccionada */}
            <div className="lg:w-72 xl:w-80 flex flex-col justify-between p-5 bg-white dark:bg-dark-secondary border-l border-gray-200 dark:border-dark-tertiary overflow-hidden">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1.5 text-gray-400 dark:text-gray-500">
                  Explorando ahora
                </p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-0.5 truncate">
                  {norm.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{norm.artist}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {norm.description}
                </p>
                {norm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {norm.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={startAR}
                  disabled={!isARSupported}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: color }}
                >
                  <Smartphone className="w-4 h-4" />
                  {isARSupported ? 'Colocar en tu espacio (AR)' : 'AR requiere móvil'}
                </button>
                {!isARSupported && (
                  <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-1.5">
                    El modelo 3D de arriba es interactivo en PC
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Obras disponibles (grid abajo) ── */}
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-widest">
                Obras disponibles en AR
                <span className="ml-2 font-normal text-gray-400 normal-case tracking-normal">({artworks.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artworks.map((sculpture) => {
                const n = normalize(sculpture);
                const isActive = featured?.id === sculpture.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setFeatured(sculpture)}
                    className="group text-left rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none bg-white dark:bg-dark-secondary hover:shadow-md"
                    style={{
                      borderColor: isActive ? color : 'transparent',
                      boxShadow: isActive ? `0 0 0 1px ${color}` : undefined,
                    }}
                  >
                    {/* Preview 3D */}
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

                      {/* Overlay hover: indica que es clickeable */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none rounded-t-xl" />
                    </div>

                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{n.artist}</p>
                    </div>
                    {isActive && (
                      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
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
