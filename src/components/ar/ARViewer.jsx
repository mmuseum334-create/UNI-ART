'use client'

/**
 * ARViewer - Augmented Reality viewer for artworks using WebXR
 * Uses Google's model-viewer for AR experiences
 * Docs: https://developers.google.com/ar/develop/webxr
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Info, Maximize2, RotateCw } from 'lucide-react';
import Script from 'next/script';
import { getModelUrl } from '@/data/arModels';

const ARViewer = ({ artwork, onExit }) => {
  const modelViewerRef = useRef(null);
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);

  // Determinar URL del modelo basado en la obra
  const modelUrl = artwork.modelUrl || getModelUrl(artwork.id) || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  useEffect(() => {
    // Cargar el script de model-viewer
    const checkModelViewer = () => {
      if (typeof window !== 'undefined' && customElements.get('model-viewer')) {
        setIsModelViewerLoaded(true);
        setIsLoading(false);
        console.log('✅ model-viewer cargado');
      }
    };

    // Esperar a que el script cargue
    const interval = setInterval(() => {
      checkModelViewer();
      if (customElements.get('model-viewer')) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout de 5 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!customElements.get('model-viewer')) {
        setError('No se pudo cargar model-viewer');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!modelViewerRef.current || !isModelViewerLoaded) return;

    const modelViewer = modelViewerRef.current;

    // Eventos de model-viewer
    const handleLoad = () => {
      console.log('✅ Modelo 3D cargado');
      setModelInfo({
        loaded: true,
        dimensions: modelViewer.getBoundingBoxCenter()
      });
    };

    const handleError = (event) => {
      console.error('❌ Error cargando modelo:', event);
      setError('Error al cargar el modelo 3D');
    };

    const handleARStatus = (event) => {
      console.log('📱 Estado AR:', event.detail.status);
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('ar-status', handleARStatus);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
      modelViewer.removeEventListener('ar-status', handleARStatus);
    };
  }, [isModelViewerLoaded]);

  if (isLoading) {
    return (
      <>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-xl font-semibold">Cargando visualizador AR...</p>
            <p className="text-sm mt-2 text-gray-300">Preparando model-viewer de Google</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <Button
            onClick={onExit}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
        {/* Header con info */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 text-white flex-1 max-w-md border border-white/10">
              <h3 className="font-bold text-lg mb-2">{artwork.title}</h3>
              <p className="text-sm text-gray-300 mb-1">por {artwork.artist}</p>
              <p className="text-xs text-gray-400 line-clamp-2">{artwork.description}</p>
            </div>

            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="bg-black/80 backdrop-blur-md border-white/20 text-white hover:bg-black/90 min-h-[44px] min-w-[44px] p-2"
            >
              <X className="h-5 w-5" />
            </Button>
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
          style={{
            width: '100%',
            height: '100vh',
            background: 'transparent'
          }}
          exposure="1"
          shadow-softness="0.5"
        >
          {/* Botón AR personalizado */}
          <button
            slot="ar-button"
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              zIndex: 1000,
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s'
            }}
          >
            📱 VER EN AR
          </button>

          {/* Loading indicator */}
          <div className="progress-bar hide" slot="progress-bar">
            <div className="update-bar"></div>
          </div>
        </model-viewer>

        {/* Instrucciones */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white z-10 px-4 max-w-md pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <Info className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-bold mb-2">Vista 3D con AR</h3>
            <p className="text-sm text-gray-300 mb-3">
              🔄 Arrastra para rotar • 🔍 Pellizca para zoom
            </p>
            <p className="text-xs text-gray-400">
              Toca &quot;VER EN AR&quot; para colocar el modelo en tu espacio real
            </p>
          </div>
        </div>

        <style jsx global>{`
          model-viewer {
            --poster-color: transparent;
            --progress-bar-color: #667eea;
          }

          model-viewer::part(default-ar-button) {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default ARViewer;
