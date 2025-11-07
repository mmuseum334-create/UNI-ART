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
    // Cargar el script de Model Viewer
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Model Viewer cargado');
        checkARSupport();
      };

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const checkARSupport = () => {
    if (modelViewerRef.current) {
      // Model Viewer automáticamente detecta soporte AR
      const modelViewer = modelViewerRef.current;

      // Escuchar el evento de carga
      modelViewer.addEventListener('load', () => {
        setIsLoading(false);
        // Verificar si AR está disponible
        if (modelViewer.canActivateAR) {
          setIsARSupported(true);
        }
      });

      modelViewer.addEventListener('error', (event) => {
        setError('Error al cargar el modelo 3D');
        setIsLoading(false);
        console.error('Error en Model Viewer:', event);
      });
    }
  };

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

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-800">
            <p className="font-semibold">Instrucciones:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Girar:</strong> Arrastra con el mouse o dedo</li>
              <li><strong>Zoom:</strong> Usa la rueda del mouse o pellizca en móvil</li>
              <li><strong>Mover:</strong> Click derecho + arrastra (PC) o dos dedos (móvil)</li>
              <li>
                <strong>AR:</strong> Haz click en &quot;Ver en AR&quot; desde un dispositivo móvil compatible
                (iOS con ARKit o Android con ARCore)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compatibilidad AR */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-2 text-sm">
          Requisitos para Realidad Aumentada:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-700 mb-1">📱 iOS (iPhone/iPad)</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>iOS 12 o superior</li>
              <li>iPhone 6S o posterior</li>
              <li>Safari o Chrome</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">🤖 Android</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Android 7.0 o superior</li>
              <li>Google Play Services for AR</li>
              <li>Chrome 79 o superior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SculptureARViewer;
