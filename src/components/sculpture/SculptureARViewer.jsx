'use client'

import { useEffect, useRef, useState } from 'react';
import { Smartphone, Maximize2, RotateCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const SculptureARViewer = ({ modelUrl, sculptureTitle = 'Escultura', posterUrl = null }) => {
  const containerRef = useRef(null);
  const mvRef = useRef(null);
  const arStatusRef = useRef('not-presenting');
  const gestureTimerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isARSupported, setIsARSupported] = useState(false);
  // arPhase: 'idle' | 'searching' | 'placed' | 'tracking_lost' | 'failed'
  const [arPhase, setArPhase] = useState('idle');
  const [showGestureHint, setShowGestureHint] = useState(false);

  /* ── build model-viewer once ── */
  useEffect(() => {
    if (!modelUrl || !containerRef.current) return;
    setIsLoading(true);
    setError(null);

    const loadLib = () => {
      if (typeof window === 'undefined') return Promise.resolve();
      if (customElements.get('model-viewer')) return Promise.resolve();
      return import('@google/model-viewer');
    };

    loadLib().then(() => {
      if (!containerRef.current) return;

      const mv = document.createElement('model-viewer');
      mv.setAttribute('src', modelUrl);
      mv.setAttribute('alt', sculptureTitle);
      if (posterUrl) mv.setAttribute('poster', posterUrl);

      // 3D quality
      mv.setAttribute('shadow-intensity', '1.5');
      mv.setAttribute('shadow-softness', '0.8');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('exposure', '1');
      mv.setAttribute('tone-mapping', 'neutral');
      mv.setAttribute('loading', 'eager');
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', '1500');
      mv.setAttribute('rotation-per-second', '25deg');
      mv.setAttribute('interaction-prompt', 'auto');

      // AR — best-practice attributes
      mv.setAttribute('ar', '');
      mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
      mv.setAttribute('ar-placement', 'floor');
      mv.setAttribute('ar-scale', 'auto');
      mv.setAttribute('xr-environment', '');

      mv.style.width = '100%';
      mv.style.height = '100%';
      mv.style.backgroundColor = 'transparent';

      /* ── load/error ── */
      mv.addEventListener('load', () => {
        setIsLoading(false);
        if (mv.canActivateAR) setIsARSupported(true);
      });
      mv.addEventListener('error', () => {
        setError('Error al cargar el modelo 3D');
        setIsLoading(false);
      });

      /* ── ar-status ── */
      mv.addEventListener('ar-status', (e) => {
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
      });

      /* ── ar-tracking ── */
      mv.addEventListener('ar-tracking', (e) => {
        const s = e.detail?.status;
        const cur = arStatusRef.current;
        if (s === 'not-tracking' && cur !== 'not-presenting') {
          setArPhase('tracking_lost');
        } else if (s === 'tracking' && cur !== 'not-presenting') {
          setArPhase(cur === 'object-placed' ? 'placed' : 'searching');
        }
      });

      /* ── AR button slot (inside model-viewer shadow DOM) ── */
      const arBtn = document.createElement('button');
      arBtn.setAttribute('slot', 'ar-button');
      arBtn.style.cssText = `
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        padding: 11px 22px;
        background: #22C55E;
        border: none;
        border-radius: 40px;
        color: white;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 4px 16px rgba(50,140,231,0.4);
        z-index: 100;
      `;
      arBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        Ver en AR
      `;
      mv.appendChild(arBtn);

      /* ── AR prompt slot — shown while scanning ── */
      const arPrompt = document.createElement('div');
      arPrompt.setAttribute('slot', 'ar-prompt');
      arPrompt.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.78);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-radius: 18px;
        padding: 16px 22px;
        color: white;
        text-align: center;
        max-width: 280px;
        width: 88vw;
        z-index: 100;
      `;
      arPrompt.innerHTML = `
        <div style="width:48px;height:48px;margin:0 auto 12px;position:relative;">
          <div style="position:absolute;top:0;left:0;width:12px;height:12px;border-top:2px solid #22C55E;border-left:2px solid #22C55E;border-radius:2px 0 0 0;"></div>
          <div style="position:absolute;top:0;right:0;width:12px;height:12px;border-top:2px solid #22C55E;border-right:2px solid #22C55E;border-radius:0 2px 0 0;"></div>
          <div style="position:absolute;bottom:0;left:0;width:12px;height:12px;border-bottom:2px solid #22C55E;border-left:2px solid #22C55E;border-radius:0 0 0 2px;"></div>
          <div style="position:absolute;bottom:0;right:0;width:12px;height:12px;border-bottom:2px solid #22C55E;border-right:2px solid #22C55E;border-radius:0 0 2px 0;"></div>
          <div style="position:absolute;left:2px;right:2px;height:2px;background:#22C55E;opacity:0.85;animation:ar-sv-scan 1.8s ease-in-out infinite;"></div>
        </div>
        <p style="font-size:14px;font-weight:600;margin:0 0 5px;">Buscando superficie plana</p>
        <p style="font-size:11px;opacity:0.65;margin:0;line-height:1.5;">Apunta al suelo y mueve el teléfono suavemente</p>
      `;
      mv.appendChild(arPrompt);

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mv);
      mvRef.current = mv;
    }).catch(() => {
      setError('No se pudo cargar el visor 3D');
      setIsLoading(false);
    });

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
      mvRef.current = null;
      clearTimeout(gestureTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]);

  useEffect(() => () => clearTimeout(gestureTimerRef.current), []);

  const handleReset = () => {
    if (mvRef.current) {
      mvRef.current.resetTurntableRotation?.();
      mvRef.current.cameraOrbit = 'auto auto auto';
    }
  };

  const handleFullscreen = () => {
    const mv = mvRef.current;
    if (!mv) return;
    if (mv.requestFullscreen) mv.requestFullscreen();
    else if (mv.webkitRequestFullscreen) mv.webkitRequestFullscreen();
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
      {/* Viewer container */}
      <div className="relative w-full aspect-square bg-slate-100 dark:bg-dark-secondary rounded-lg overflow-hidden shadow-xl">

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-dark-primary/90 z-10">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Cargando modelo 3D...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-dark-primary/90 z-10">
            <div className="text-center p-6">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p className="text-red-600 font-semibold mb-1">{error}</p>
              <p className="text-sm text-slate-500">Verifica que el archivo del modelo sea válido</p>
            </div>
          </div>
        )}

        {/* AR phase overlays */}
        {arPhase === 'searching' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Detectando superficie...
          </div>
        )}

        {arPhase === 'placed' && showGestureHint && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 px-4 py-3 rounded-xl text-white text-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', minWidth: '200px' }}>
            <p className="text-xs font-bold mb-2">¡Colocada! Usa gestos para:</p>
            <div className="flex justify-center gap-4 text-center">
              <div><div className="text-base">↻</div><div className="text-[10px] opacity-60">Rotar</div></div>
              <div><div className="text-base">⤢</div><div className="text-[10px] opacity-60">Escalar</div></div>
              <div><div className="text-base">✥</div><div className="text-[10px] opacity-60">Mover</div></div>
            </div>
          </div>
        )}

        {arPhase === 'tracking_lost' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
            style={{ backgroundColor: 'rgba(185,28,28,0.85)' }}>
            ⚠ Tracking perdido — mueve más despacio
          </div>
        )}

        {arPhase === 'failed' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-2 rounded-xl text-white text-xs text-center"
            style={{ backgroundColor: 'rgba(185,28,28,0.85)', maxWidth: '240px' }}>
            <p className="font-semibold">No se pudo iniciar AR</p>
            <p className="opacity-75 mt-0.5">Verifica permisos de cámara</p>
          </div>
        )}

        {/* model-viewer mount point */}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Controls */}
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

      <style>{`
        @keyframes ar-sv-scan {
          0%   { top: 3px; opacity: 0.3; }
          50%  { opacity: 1; }
          100% { top: 43px; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default SculptureARViewer;
