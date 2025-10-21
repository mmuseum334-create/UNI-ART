/**
 * @fileoverview Página principal/Home del sitio
 * @description Muestra featured artworks, categorías y secciones destacadas
 * Client Component - usa hooks de estado
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CategoryShowcase } from '../components/ui/CategoryShowcase';
import ArtCollageSection from '../components/ui/TrendingArtists';
import { FeaturedCollections } from '../components/ui/FeaturedCollections';
import { Carousel, CarouselItem } from '../components/ui/Carousel';
import { artCategories } from '../data/mockData';
import { paintService } from '../services/paint/paintService';
import {
  ArrowRight,
  TrendingUp,
  Users,
  Heart,
  Eye,
  BookOpen,
  Music,
  Video,
  Palette,
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
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todas las pinturas desde el backend
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        setIsLoading(true);
        const response = await paintService.getAll();

        console.log('Respuesta del backend:', response); // Debug

        if (response.success && response.data) {
          // Transformar las pinturas del backend al formato esperado
          const transformedPaintings = response.data.map(paint => {
            // Procesar etiquetas: convertir string "tag1, tag2, tag3" a array
            let tagsArray = [];
            if (paint.etiqueta && typeof paint.etiqueta === 'string') {
              tagsArray = paint.etiqueta.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }

            // Extraer año de la fecha
            let year = null;
            if (paint.fecha) {
              try {
                year = new Date(paint.fecha).getFullYear();
              } catch {
                year = null;
              }
            }

            console.log('Pintura mapeada:', {
              id: paint.id,
              title: paint.nombre_pintura,
              imageUrl: paint.img_pintura
            }); // Debug

            return {
              id: paint.id,
              title: paint.nombre_pintura || 'Sin título',
              artist: paint.artista || 'Artista Anónimo',
              category: paint.categoria || 'paintings',
              description: paint.descripcion_pintura || 'Una hermosa obra de arte que refleja la creatividad y expresión del artista.',
              imageUrl: paint.img_pintura,
              thumbnailUrl: paint.img_pintura,
              tags: tagsArray,
              techniques: paint.tecnicas || null,
              likes: paint.likes || 0,
              views: paint.views || 0,
              createdAt: paint.created_at,
              year: year,
              publishedBy: paint.publicado_por,
            };
          });

          console.log('Pinturas transformadas:', transformedPaintings); // Debug
          setFeaturedArtworks(transformedPaintings);
          setError(null);
        } else {
          setError(response.error || 'No se pudieron cargar las pinturas');
          setFeaturedArtworks([]);
        }
      } catch (err) {
        console.error('Error al cargar pinturas:', err);
        setError('Error al cargar las pinturas');
        setFeaturedArtworks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaintings();
  }, []);

  const stats = [
    { label: 'Obras de Arte', value: featuredArtworks.length.toString(), icon: Palette },
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
                <Button
                  size="lg"
                  className="flex items-center gap-2 bg-nature-600 hover:bg-nature-700 text-white shadow-2xl hover:shadow-nature-600/50 transition-all duration-300 transform hover:scale-105"
                >
                  Explorar Catálogo
                  <ArrowRight className="h-5 w-5" />
                </Button>
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
                      <div className="p-3 rounded-full bg-gradient-to-r from-nature-100 to-museum-100 dark:from-dark-tertiary dark:to-dark-tertiary">
                        <IconComponent className="h-8 w-8 text-nature-600 dark:text-nature-400" />
                      </div>
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
      <section className="py-20 bg-slate-50 dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Obras Destacadas
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Explora la colección completa de obras de arte creadas por nuestra talentosa comunidad de artistas.
                Cada pieza cuenta una historia única y refleja la pasión y creatividad de sus autores.
              </p>
            </div>
            <Link href="/catalog" className="hidden md:block">
              <Button variant="outline" size="lg">
                Ver Todo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 dark:border-nature-400"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : featuredArtworks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Aún no hay obras para mostrar.
              </p>
              {isAuthenticated && (
                <Link href="/upload">
                  <Button>
                    Subir tu Primera Obra
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Carousel
              itemsPerView={3}
              autoPlay={true}
              autoPlayInterval={5000}
              shoDots={true}
              className="p-5"
            >
              {featuredArtworks.map((artwork) => (
                <CarouselItem key={artwork.id}>
                  <Link href={`/artwork/${artwork.id}`}>
                    <Card className="group relative overflow-hidden card-hover cursor-pointer h-full bg-white dark:bg-dark-primary border-2 border-slate-200 dark:border-dark-tertiary hover:border-nature-400 dark:hover:border-nature-600 transition-all duration-300">
                      {/* Image Container with Overlay */}
                      <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100 dark:bg-dark-tertiary">
                        <img
                          src={artwork.imageUrl || artwork.thumbnailUrl || 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen'}
                          alt={artwork.title}
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen';
                          }}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Category Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 dark:bg-dark-primary/90 backdrop-blur-sm text-slate-900 dark:text-white border border-white/20 shadow-lg text-xs">
                            <Palette className="h-3 w-3 mr-1" />
                            {artCategories.find(cat => cat.id === artwork.category)?.name || 'Pintura'}
                          </Badge>
                        </div>

                        {/* Quick Stats on Hover */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                            <Heart className="h-3 w-3" />
                            <span>{artwork.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                            <Eye className="h-3 w-3" />
                            <span>{artwork.views}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <CardHeader className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-nature-600 dark:group-hover:text-nature-400 transition-colors">
                            {artwork.title}
                          </CardTitle>
                          {artwork.year && (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {artwork.year}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2 leading-relaxed">
                          {artwork.description}
                        </p>

                        {/* Artist and Tags in same row */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Tags */}
                          {artwork.tags && artwork.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {artwork.tags.slice(0, 2).map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-slate-50 dark:bg-dark-tertiary hover:bg-nature-50 dark:hover:bg-nature-900/20 transition-colors"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                              {artwork.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{artwork.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Artist Info */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nature-400 to-museum-500 flex items-center justify-center text-white text-xs font-bold">
                              {artwork.artist.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                              {artwork.artist}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </Carousel>
          )}
        </div>
      </section>

      {/* Category Showcase */}
      <CategoryShowcase categories={artCategories} iconMap={iconMap} />

      {/* Trending Artists */}
      <ArtCollageSection />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-nature-600 via-museum-500 to-nature-500">
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
                <Button size="lg" variant="secondary">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            ) : (
              <Link href="/upload">
                <Button size="lg" variant="secondary">
                  Subir tu Primera Obra
                </Button>
              </Link>
            )}
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-nature-600">
                Explorar Galería
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;