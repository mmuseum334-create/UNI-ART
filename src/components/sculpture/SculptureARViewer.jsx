/**
 * SculptureARViewer - Componente para visualizar modelos 3D con realidad aumentada
 * Usa Google Model Viewer para AR nativo en iOS (ARKit) y Android (ARCore)
 */
'use client'

import { useEffect, useRef, useState } from 'react';
import { Smartphone, Maximize2, RotateCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const SculptureARViewer = ({ modelUrl, sculptureTitle = 'Escultura', posterUrl = null }) => {
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    // Cargar el paquete npm UNA SOLA VEZ con guard de singleton
    if (typeof window !== 'undefined') {
      if (!customElements.get('model-viewer')) {
        import('@google/model-viewer').catch((err) => {
          console.error('Error cargando model-viewer:', err);
          setError('No se pudo cargar el visor 3D');
          setIsLoading(false);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!modelViewerRef.current) return;

    const modelViewer = modelViewerRef.current;

    const handleLoad = () => {
      setIsLoading(false);
      if (modelViewer.canActivateAR) {
        setIsARSupported(true);
      }
    };

    const handleError = (event) => {
      setError('Error al cargar el modelo 3D');
      setIsLoading(false);
      console.error('Error en Model Viewer:', event);
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, []);

  const handleReset = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation();
      modelViewerRef.current.cameraOrbit = 'auto auto auto';
    }
  };

  const handleFullscreen = () => {
    if (modelViewerRef.current) {
      if (modelViewerRef.current.requestFullscreen) {
        modelViewerRef.current.requestFullscreen();
      } else if (modelViewerRef.current.webkitRequestFullscreen) {
        modelViewerRef.current.webkitRequestFullscreen();
      }
    }
  };

  if (!modelUrl) {
    return (
      <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">No hay modelo 3D disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contenedor del visor */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden shadow-xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando modelo 3D...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center p-6">
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-slate-600">
                Verifica que el archivo del modelo sea válido
              </p>
            </div>
          </div>
        )}

        {/* Model Viewer */}
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          alt={sculptureTitle}
          poster={posterUrl}
          shadow-intensity="1"
          camera-controls
          auto-rotate
          auto-rotate-delay="1000"
          rotation-per-second="30deg"
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
          }}
        >
          {/* Botón AR personalizado */}
          <button
            slot="ar-button"
            className="absolute bottom-4 right-4 bg-nature-600 hover:bg-nature-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
          >
            <Smartphone className="h-5 w-5" />
            Ver en AR
          </button>

          {/* Controles adicionales */}
          <div
            slot="progress-bar"
            className="absolute bottom-2 left-2 right-2 h-1 bg-slate-200 rounded-full overflow-hidden"
          >
            <div className="h-full bg-nature-600 transition-all duration-300"></div>
          </div>
        </model-viewer>
      </div>

      {/* Controles del visor */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reiniciar Vista
          </Button>
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Pantalla Completa
          </Button>
        </div>

        {isARSupported && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Smartphone className="h-4 w-4" />
            <span>AR Disponible</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default SculptureARViewer;