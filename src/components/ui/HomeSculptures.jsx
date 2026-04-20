'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { useColor } from '@/contexts/ColorContext';

const HomeSculptures = () => {
  const router = useRouter();
  const { color } = useColor();
  const [sculptures, setSculptures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSculptures = async () => {
      try {
        const response = await sculptureService.getAll();
        if (response.success && response.data) {
          const completedSculptures = response.data.filter(
            s => s.estado_procesamiento === 'completado' && s.modelo_3d_url
          );
          setSculptures(completedSculptures);
        }
      } catch (err) {
        console.error('Error fetching sculptures:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSculptures();
  }, []);

  // Guard para inicializar model-viewer de forma segura
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!customElements.get('model-viewer')) {
        import('@google/model-viewer').catch(console.error);
      }
    }
  }, []);

  if (isLoading || sculptures.length === 0) {
    return null;
  }

  const currentSculpture = sculptures[currentIndex];

  return (
    <section className="relative w-full h-full py-20 flex items-center justify-center bg-white dark:bg-[#0f0f0f] overflow-hidden selection:bg-slate-200 dark:selection:bg-white/20 transition-colors duration-300">

      {/* Background Glows & Effects */}
      <div
        className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full blur-[100px] dark:blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen opacity-20 dark:opacity-30"
        style={{ backgroundColor: color || '#4f46e5' }}
      />
      <div
        className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] dark:blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen opacity-20 dark:opacity-20"
        style={{ backgroundColor: color || '#2563eb' }}
      />

      {/* Gradient Fades for smooth transitions */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white dark:from-[#0f0f0f] to-transparent z-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Typography & Call to action */}
          <div className="lg:col-span-5 relative z-30 pt-10 lg:pt-0 text-center lg:text-left">
            <h2 className="text-[4rem] sm:text-[5.5rem] lg:text-[7.5rem] leading-[0.85] font-black text-slate-900 dark:text-white tracking-tighter mb-6 uppercase transition-colors">
              ARTE <br className="hidden sm:block" />
              <span style={{ color: color || '#4f46e5' }} className="transition-colors duration-500">
                EN 3D
              </span>
            </h2>
            <div className="mb-6">
              <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1 line-clamp-1 transition-colors">{currentSculpture?.nombre_escultura}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-bold tracking-widest uppercase transition-colors">Por {currentSculpture?.artista}</p>
            </div>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed mb-10 line-clamp-4 transition-colors">
              {currentSculpture?.descripcion_escultura}
            </p>

            <button
              onClick={() => router.push(`/sculpture/${currentSculpture.id}`)}
              className="group relative px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-xs sm:text-sm rounded-full overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95 shadow-xl"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-gray-200 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                Ver Detalles y AR
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>

          {/* 3D Single Model Display */}
          <div className="lg:col-span-7 relative h-[60vh] lg:h-[85vh] w-full mt-8 lg:mt-0 flex items-center justify-center">

            {/* Minimalist Vertical Nav Controls */}
            <div className="absolute right-0 lg:-right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-40">
              {sculptures.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1 transition-all duration-500 ease-out rounded-full ${idx === currentIndex ? 'h-12' : 'h-4 opacity-40 hover:opacity-80 bg-slate-400 dark:bg-white/50'}`}
                  style={idx === currentIndex ? { backgroundColor: color || '#4f46e5', boxShadow: `0 0 10px ${color || '#4f46e5'}66` } : {}}
                  aria-label={`Ver escultura ${idx + 1}`}
                />
              ))}
            </div>

            <div className="w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[600px] relative z-30">
              <model-viewer
                key={currentSculpture.id}
                src={currentSculpture.modelo_3d_url}
                alt={currentSculpture.nombre_escultura}
                shadow-intensity="1"
                shadow-softness="0.5"
                camera-controls
                disable-zoom
                bounds="tight"
                scale="0.85 0.85 0.85"
                auto-rotate
                auto-rotate-delay="1000"
                rotation-per-second="30deg"
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                loading="eager"
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                className="w-full h-full cursor-grab active:cursor-grabbing outline-none drop-shadow-none"
              ></model-viewer>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeSculptures;
