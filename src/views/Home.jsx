/**
 * @fileoverview Página principal/Home del sitio
 * @description Muestra featured artworks, categorías y secciones destacadas
 * Client Component - usa hooks de estado
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { CategoryShowcase } from '../components/ui/CategoryShowcase';
import ArtCollageSection from '../components/ui/TrendingArtists';
import FeaturedArtworks from '../components/ui/FeaturedArtworks';
import { useColor } from '@/contexts/ColorContext';
import { UserColorIconCircle, UserColorButton, UserColorSection } from '../components/ui/UserColorElements';
import { artCategories } from '../data/mockData';
import {
  ArrowRight,
  TrendingUp,
  Users,
  Palette,
  BookOpen,
  Music,
  Video,
  Image,
  Box,
  Sparkles,
  FileText,
  Camera
} from 'lucide-react';

const iconMap = {
  BookOpen,
  Music,
  Video,
  Palette,
  Image,
  Box,
  Sparkles,
  FileText,
  Camera
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  const stats = [
    { label: 'Obras de Arte', value: '...', icon: Palette },
    { label: 'Artistas', value: '312', icon: Users },
    { label: 'Visitantes', value: '125k', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden py-32 min-h-[600px] flex items-center">
        {/* Video Background */}
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

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>

        {/* Content */}
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Estadísticas del Museo
            </h2>
            <p className="text-slate-600 dark:text-slate-300">Números que reflejan nuestra comunidad artística</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <UserColorIconCircle>
                        <IconComponent className="h-8 w-8 text-white" />
                      </UserColorIconCircle>
                    </div>
                    <div className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Artworks Carousel */}
      <FeaturedArtworks />

      {/* Category Showcase */}
      <CategoryShowcase categories={artCategories} iconMap={iconMap} />

      {/* Trending Artists */}
      <ArtCollageSection />

      {/* Call to Action */}
      <UserColorSection className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            ¿Eres un Artista?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a nuestra comunidad y comparte tu arte con el mundo.
            Es gratuito y fácil de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="bg-white hover:bg-white/90">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            ) : (
              <Link href="/upload">
                <Button size="lg" variant="secondary" className="bg-white hover:bg-white/90">
                  Subir tu Primera Obra
                </Button>
              </Link>
            )}
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all">
                Explorar Galería
              </Button>
            </Link>
          </div>
        </div>
      </UserColorSection>
    </div>
  );
};

export default Home;