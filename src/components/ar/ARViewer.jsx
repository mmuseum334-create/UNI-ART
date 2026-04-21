'use client'

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Loader2, Box, RotateCcw } from 'lucide-react';
import { useColor } from '@/contexts/ColorContext';

const ARViewer = ({ artwork, onExit }) => {
  const { color } = useColor();
  const mvRef = useRef(null);
  const arStatusRef = useRef('not-presenting');
  const gestureTimerRef = useRef(null);

  const [mvLoaded, setMvLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  // arPhase: 'idle' | 'searching' | 'placed' | 'tracking_lost' | 'failed'
  const [arPhase, setArPhase] = useState('idle');
  const [showGestureHint, setShowGestureHint] = useState(false);

  const modelUrl = artwork.modelUrl || '';

  /* ── load library ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (customElements.get('model-viewer')) { setMvLoaded(true); return; }
    import('@google/model-viewer')
      .then(() => setMvLoaded(true))
      .catch(() => { setModelError('No se pudo cargar el visor 3D'); setModelLoading(false); });
  }, []);

  /* ── attach events ── */
  useEffect(() => {
    if (!mvRef.current || !mvLoaded) return;
    const mv = mvRef.current;

    const onLoad = () => setModelLoading(false);
    const onError = () => { setModelError('Error al cargar el modelo 3D'); setModelLoading(false); };

    const onArStatus = (e) => {
      const s = e.detail?.status;
      arStatusRef.current = s;
      if (s === 'session-started') {
        setArPhase('searching');
        setShowGestureHint(false);
      } else if (s === 'object-placed') {
        setArPhase('placed');
        setShowGestureHint(true);
        clearTimeout(gestureTimerRef.current);
        gestureTimerRef.current = setTimeout(() => setShowGestureHint(false), 5000);
      } else if (s === 'not-presenting') {
        setArPhase('idle');
        setShowGestureHint(false);
        clearTimeout(gestureTimerRef.current);
      } else if (s === 'failed') {
        setArPhase('failed');
      }
    };

    const onArTracking = (e) => {
      const s = e.detail?.status;
      const cur = arStatusRef.current;
      if (s === 'not-tracking' && cur !== 'not-presenting') {
        setArPhase('tracking_lost');
      } else if (s === 'tracking' && cur !== 'not-presenting') {
        setArPhase(cur === 'object-placed' ? 'placed' : 'searching');
      }
    };

    mv.addEventListener('load', onLoad);
    mv.addEventListener('error', onError);
    mv.addEventListener('ar-status', onArStatus);
    mv.addEventListener('ar-tracking', onArTracking);
    return () => {
      mv.removeEventListener('load', onLoad);
      mv.removeEventListener('error', onError);
      mv.removeEventListener('ar-status', onArStatus);
      mv.removeEventListener('ar-tracking', onArTracking);
    };
  }, [mvLoaded]);

  useEffect(() => () => clearTimeout(gestureTimerRef.current), []);

  const handleReset = () => {
    if (mvRef.current) {
      mvRef.current.resetTurntableRotation?.();
      mvRef.current.cameraOrbit = 'auto auto auto';
    }
  };

  /* ── loading screen ── */
  if (!mvLoaded && !modelError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Loader2 className="w-16 h-16 animate-spin text-gray-200 dark:text-gray-800" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Box className="w-7 h-7" style={{ color }} />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando visualizador AR...</p>
        </div>
      </div>
    );
  }

  /* ── error screen ── */
  if (modelError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{modelError}</p>
          <Button onClick={onExit} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-dark-primary overflow-hidden">

      {/* Header — visible in 3D mode */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="flex justify-between items-start gap-3 pointer-events-auto">
          <div className="bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-md rounded-2xl px-4 py-3 flex-1 max-w-md border border-gray-200 dark:border-dark-tertiary shadow-sm">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-0.5 line-clamp-1">{artwork.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">por {artwork.artist}</p>
          </div>
          <button
            onClick={onExit}
            className="w-11 h-11 rounded-xl bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-md border border-gray-200 dark:border-dark-tertiary shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Model loading overlay */}
      {modelLoading && (
        <div className="absolute inset-0 z-30 bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color }} />
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando modelo 3D...</p>
          </div>
        </div>
      )}

      {/* ─── model-viewer ─── */}
      <model-viewer
        ref={mvRef}
        src={modelUrl}
        alt={artwork.title}
        poster={artwork.thumbnail || undefined}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-placement="floor"
        ar-scale="auto"
        xr-environment
        camera-controls
        auto-rotate
        auto-rotate-delay="3000"
        rotation-per-second="20deg"
        shadow-intensity="1.5"
        shadow-softness="0.8"
        exposure="1"
        environment-image="neutral"
        tone-mapping="neutral"
        interaction-prompt="auto"
        style={{ width: '100%', height: '100vh', background: 'transparent' }}
      >
        {/* AR Button — visible in AR session and as CTA in 3D mode */}
        <button
          slot="ar-button"
          style={{
            position: 'absolute',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '14px 28px',
            backgroundColor: color,
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 6px 24px ${color}44`,
            zIndex: 1000,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          Colocar en tu espacio
        </button>

        {/* AR Prompt — shown while searching for surface (visible in WebXR session) */}
        <div
          slot="ar-prompt"
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '18px 24px',
            color: 'white',
            textAlign: 'center',
            maxWidth: '300px',
            width: '88vw',
            zIndex: 1000,
          }}
        >
          {/* Animated scan frame */}
          <div style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 14px',
            position: 'relative',
          }}>
            {/* Corner brackets */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '2px 0 0 0' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '14px', height: '14px', borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 2px 0 0' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '14px', height: '14px', borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '0 0 0 2px' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 0 2px 0' }} />
            {/* Scanning line */}
            <div style={{
              position: 'absolute',
              left: '2px',
              right: '2px',
              height: '2px',
              backgroundColor: color,
              opacity: 0.8,
              animation: 'ar-scan 1.8s ease-in-out infinite',
            }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 5px', letterSpacing: '0.01em' }}>
            Buscando superficie plana
          </p>
          <p style={{ fontSize: '12px', opacity: 0.65, margin: 0, lineHeight: 1.5 }}>
            Apunta al suelo y mueve el teléfono suavemente hacia adelante y atrás
          </p>
        </div>
      </model-viewer>

      {/* ─── 3D mode overlays (shown when not in AR) ─── */}

      {/* Info hint — idle 3D view */}
      {arPhase === 'idle' && !modelLoading && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 px-4 max-w-sm w-full pointer-events-none">
          <div className="bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-md rounded-2xl px-5 py-4 border border-gray-200 dark:border-dark-tertiary shadow-sm text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Vista 3D interactiva</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Arrastra para rotar · Pellizca para hacer zoom
            </p>
            <div className="border-t border-gray-100 dark:border-dark-tertiary mt-3 pt-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Usa el botón de abajo para colocarla en tu espacio real
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Searching banner */}
      {arPhase === 'searching' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Detectando superficie...
        </div>
      )}

      {/* Gesture hints — right after placement */}
      {arPhase === 'placed' && showGestureHint && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-5 py-4 rounded-2xl text-white text-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(16px)', minWidth: '240px' }}>
          <p className="text-sm font-bold mb-3">¡Escultura colocada!</p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl mb-1">↻</div>
              <div className="text-[11px] opacity-60">Rotar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⤢</div>
              <div className="text-[11px] opacity-60">Escalar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">✥</div>
              <div className="text-[11px] opacity-60">Mover</div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking lost warning */}
      {arPhase === 'tracking_lost' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold"
          style={{ backgroundColor: 'rgba(185,28,28,0.85)', backdropFilter: 'blur(12px)' }}>
          ⚠ Tracking perdido — mueve el teléfono más despacio
        </div>
      )}

      {/* AR failed warning */}
      {arPhase === 'failed' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-white text-sm text-center max-w-xs"
          style={{ backgroundColor: 'rgba(185,28,28,0.85)', backdropFilter: 'blur(12px)' }}>
          <p className="font-semibold mb-1">No se pudo iniciar AR</p>
          <p className="text-xs opacity-80">Asegúrate de dar permisos de cámara y estar en un espacio bien iluminado.</p>
        </div>
      )}

      {/* Reset button */}
      {arPhase === 'idle' && !modelLoading && (
        <button
          onClick={handleReset}
          className="absolute bottom-7 right-5 w-11 h-11 rounded-full bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-md border border-gray-200 dark:border-dark-tertiary shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors z-10"
          aria-label="Reiniciar vista"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      <style>{`
        @keyframes ar-scan {
          0%   { top: 4px; opacity: 0.3; }
          50%  { opacity: 1; }
          100% { top: 44px; opacity: 0.3; }
        }
        model-viewer {
          --poster-color: transparent;
          --progress-bar-color: ${color};
        }
        model-viewer::part(default-ar-button) {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ARViewer;
