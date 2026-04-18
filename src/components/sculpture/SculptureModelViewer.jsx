'use client'

import { useEffect, useRef, useState } from 'react';
import { Box, Loader2, AlertTriangle } from 'lucide-react';

/**
 * SculptureModelViewer
 * Renderiza un modelo 3D .glb usando @google/model-viewer
 * Compatible con Next.js (carga el web component en cliente)
 */
export default function SculptureModelViewer({ src, poster, style, autoRotate = true, cameraControls = true }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!src || !containerRef.current) return;

    setLoading(true);
    setError(false);

    // Importar el web component solo en cliente
    import('@google/model-viewer')
      .then(() => {
        if (!containerRef.current) return;

        // Crear el elemento nativo para evitar conflictos con el JSX de React
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', src);
        if (poster) mv.setAttribute('poster', poster);
        if (autoRotate) mv.setAttribute('auto-rotate', '');
        if (cameraControls) mv.setAttribute('camera-controls', '');
        mv.setAttribute('shadow-intensity', '1');
        mv.setAttribute('environment-image', 'neutral');
        mv.setAttribute('exposure', '0.9');
        mv.setAttribute('tone-mapping', 'neutral');
        mv.style.width  = '100%';
        mv.style.height = '100%';
        mv.style.backgroundColor = 'transparent';

        // Eventos del modelo
        mv.addEventListener('load', () => setLoading(false));
        mv.addEventListener('error', () => { setLoading(false); setError(true); });

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(mv);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [src, poster, autoRotate, cameraControls]);

  return (
    <div className="relative w-full h-full" style={style}>
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/80 backdrop-blur-sm rounded-inherit">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400 mb-2" />
          <span className="text-xs text-white/60">Cargando modelo 3D…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/80 rounded-inherit">
          <AlertTriangle className="h-6 w-6 text-amber-400 mb-1" />
          <span className="text-xs text-white/50">Error al cargar el modelo</span>
        </div>
      )}

      {/* Contenedor del web component */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
