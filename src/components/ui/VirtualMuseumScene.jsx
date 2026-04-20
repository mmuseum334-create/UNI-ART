'use client';

import { useEffect, useState } from 'react';

export default function VirtualMuseumScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Import A-Frame dynamically on the client side only
    import('aframe').then(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium tracking-wide">Cargando Experiencia Inmersiva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Botón para regresar al sitio principal */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 z-[10000] bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg border border-white/10 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Salir del Museo
      </button>

      {/* Controles Info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-black/50 backdrop-blur-md text-white/80 px-6 py-3 rounded-full text-sm flex gap-6 border border-white/10 pointer-events-none">
        <span className="flex items-center gap-2"><kbd className="bg-white/20 px-2 py-1 rounded text-xs">W A S D</kbd> Moverse</span>
        <span className="flex items-center gap-2"><kbd className="bg-white/20 px-2 py-1 rounded text-xs">Click + Arrastrar</kbd> Mirar</span>
      </div>

      <a-scene 
        vr-mode-ui="enabled: true"
        renderer="antialias: true; colorManagement: true; sortObjects: true; physicallyCorrectLights: true; maxCanvasWidth: 1920; maxCanvasHeight: 1920;"
      >
        {/* Modelo de Museo cargado directamente */}
        <a-entity 
          gltf-model="/models/vr_art_gallery_01.glb" 
          position="0 0 0" 
          scale="1 1 1"
          shadow="cast: true; receive: true"
        ></a-entity>

        {/* Iluminación básica e intensa por si el modelo es oscuro */}
        <a-light type="ambient" color="#ffffff" intensity="2"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.5" position="-1 2 1"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.5" position="1 2 -1"></a-light>

        {/* Cámara con controles WASD (teclado/pc) y Look (mouse/móvil/VR) */}
        {/* Usamos fly: false para no volar y ajustamos la altura al promedio humano (1.6m) */}
        <a-entity position="0 0 0">
          <a-camera 
            wasd-controls="acceleration: 20; fly: false;" 
            look-controls="pointerLockEnabled: false"
          ></a-camera>
        </a-entity>
        
        {/* Cielo */}
        <a-sky color="#87CEEB"></a-sky>
      </a-scene>
    </div>
  );
}
