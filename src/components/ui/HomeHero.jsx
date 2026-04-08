'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './Button';
import { UserColorButton } from './UserColorElements';
import { ArrowRight } from 'lucide-react';

const HomeHero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden py-32 min-h-[600px] flex items-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/sesion1.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>

      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-2xl">
            Bienvenido al Museo Virtual
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            Descubre, explora y comparte el arte en todas sus formas.
            Un espacio donde la creatividad no tiene límites y cada obra cuenta una historia única.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <UserColorButton className="px-8 py-3 text-base shadow-2xl transition-all duration-300 transform hover:scale-105">
                Explorar Catálogo
                <ArrowRight className="h-5 w-5 ml-2" />
              </UserColorButton>
            </Link>
            {!isAuthenticated && (
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-slate-900 shadow-2xl backdrop-blur-sm bg-white/10 transition-all duration-300 transform hover:scale-105"
                >
                  Únete Ahora
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
