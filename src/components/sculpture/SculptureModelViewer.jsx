'use client'

import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

let mvLibLoaded = false;
const loadLib = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (mvLibLoaded || customElements.get('model-viewer')) { mvLibLoaded = true; return Promise.resolve(); }
  return import('@google/model-viewer').then(() => { mvLibLoaded = true; });
};

export default function SculptureModelViewer({
  src,
  poster,
  style,
  autoRotate = true,
  cameraControls = true,
}) {
  const mvRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ── crear el web component una sola vez ── */
  useEffect(() => {
    if (!src || !containerRef.current) return;

    setLoading(true);
    setError(false);

    loadLib().then(() => {
      if (!containerRef.current) return;

      const mv = document.createElement('model-viewer');
      mv.setAttribute('src', src);
      if (poster) mv.setAttribute('poster', poster);
      mv.setAttribute('shadow-intensity', '1');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('exposure', '0.9');
      mv.setAttribute('tone-mapping', 'neutral');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('loading', 'lazy');
      if (cameraControls) mv.setAttribute('camera-controls', '');
      if (autoRotate) {
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('auto-rotate-delay', '0');
        mv.setAttribute('rotation-per-second', '25deg');
      }
      mv.style.width = '100%';
      mv.style.height = '100%';
      mv.style.backgroundColor = 'transparent';
      mv.style.pointerEvents = cameraControls ? 'auto' : 'none';

      mv.addEventListener('load', () => setLoading(false));
      mv.addEventListener('error', () => { setLoading(false); setError(true); });

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mv);
      mvRef.current = mv;
    }).catch(() => {
      setLoading(false);
      setError(true);
    });

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
      mvRef.current = null;
    };
  // solo recrear si cambia la URL del modelo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  /* ── controlar auto-rotate sin remontar ── */
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;

    if (autoRotate) {
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', '0');
      mv.setAttribute('rotation-per-second', '25deg');
    } else {
      mv.removeAttribute('auto-rotate');
      mv.resetTurntableRotation?.();
      mv.cameraOrbit = 'auto auto auto';
    }
  }, [autoRotate]);

  return (
    <div className="relative w-full h-full" style={style}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/70 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400 mb-1.5" />
          <span className="text-xs text-white/50">Cargando 3D…</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/70">
          <AlertTriangle className="h-5 w-5 text-amber-400 mb-1" />
          <span className="text-xs text-white/50">Error al cargar</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
