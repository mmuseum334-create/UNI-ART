'use client'

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Info, Loader2, Box } from 'lucide-react';
import { useColor } from '@/contexts/ColorContext';

const ARViewer = ({ artwork, onExit }) => {
  const { color } = useColor();
  const modelViewerRef = useRef(null);
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const modelUrl = artwork.modelUrl || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (customElements.get('model-viewer')) {
      setIsModelViewerLoaded(true);
      setIsLoading(false);
      return;
    }
    import('@google/model-viewer')
      .then(() => { setIsModelViewerLoaded(true); setIsLoading(false); })
      .catch(() => { setError('No se pudo cargar el visor 3D'); setIsLoading(false); });
  }, []);

  useEffect(() => {
    if (!modelViewerRef.current || !isModelViewerLoaded) return;
    const mv = modelViewerRef.current;
    const onError = () => setError('Error al cargar el modelo 3D');
    mv.addEventListener('error', onError);
    return () => mv.removeEventListener('error', onError);
  }, [isModelViewerLoaded]);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{error}</p>
          <Button onClick={onExit} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-dark-primary overflow-hidden">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-md rounded-2xl px-4 py-3 flex-1 max-w-md border border-gray-200 dark:border-dark-tertiary shadow-sm">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-0.5">{artwork.title}</h3>
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

      {/* Model Viewer */}
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt={artwork.title}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        shadow-softness="0.5"
        style={{ width: '100%', height: '100vh', background: 'transparent' }}
      >
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
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: `0 6px 20px ${color}55`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          Ver en AR
        </button>

        <div className="progress-bar hide" slot="progress-bar">
          <div className="update-bar"></div>
        </div>
      </model-viewer>

      {/* Instrucciones */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-10 px-4 max-w-sm pointer-events-none">
        <div className="bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-md rounded-2xl px-5 py-4 border border-gray-200 dark:border-dark-tertiary shadow-sm">
          <Info className="w-5 h-5 mx-auto mb-2" style={{ color }} />
          <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Vista 3D interactiva</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Arrastra para rotar · Pellizca para zoom
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Toca "Ver en AR" para colocarlo en tu espacio real
          </p>
        </div>
      </div>

      <style jsx global>{`
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
