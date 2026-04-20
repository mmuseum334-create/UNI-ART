'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Carousel, CarouselItem } from './Carousel';
import { useColor } from '@/contexts/ColorContext';
import { UserColorBadge, UserColorButton } from './UserColorElements';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import { ArrowRight, Palette, Heart, Eye } from 'lucide-react';

const FeaturedArtworks = ({ 
  title = "Obras Destacadas",
  description = "Explora la colección completa de obras de arte creadas por nuestra talentosa comunidad de artistas. Cada pieza cuenta una historia única y refleja la pasión y creatividad de sus autores."
}) => {
  const { color } = useColor();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        setIsLoading(true);
        const response = await paintService.getAll();

        if (response.success && response.data) {
          const transformedPaintings = response.data.map(paint => {
            let tagsArray = [];
            if (paint.etiqueta && typeof paint.etiqueta === 'string') {
              tagsArray = paint.etiqueta.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }

            let year = null;
            if (paint.fecha) {
              try { year = new Date(paint.fecha).getFullYear(); } catch { year = null; }
            }

            return {
              id: paint.id,
              title: paint.nombre_pintura || 'Sin título',
              artist: paint.artista || 'Artista Anónimo',
              category: paint.categoria || 'paintings',
              description: paint.descripcion_pintura || 'Una hermosa obra de arte que refleja la creatividad y expresión del artista.',
              imageUrl: paint.img_pintura,
              thumbnailUrl: paint.img_pintura,
              tags: tagsArray,
              likes: paint.likes || 0,
              views: paint.views || 0,
              year,
              publishedBy: paint.publicado_por,
            };
          });

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

  return (
    <section className="py-12 pb-16 px-6 bg-slate-50 dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white pt-10 pb-8 rounded-2xl shadow-[0_0px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0px_20px_rgba(0,0,0,0.2)] dark:bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-3">
              {title}
            </h2>
            <p className="text-base text-slate-600 dark:text-white/70 leading-relaxed">
              {description}
            </p>
          </div>
          <Link href="/catalog" className="hidden sm:block flex-shrink-0">
            <Button
              variant="outline"
              size="lg"
              className="border-2"
              style={{ borderColor: color, color: color }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = color;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = color;
              }}
            >
              Ver Todo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nature-600 dark:border-nature-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>
            <Button size="sm" onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        ) : featuredArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-300 mb-3 text-sm">Aún no hay obras para mostrar.</p>
            {isAuthenticated && (
              <Link href="/upload">
                <UserColorButton size="sm">Subir tu Primera Obra</UserColorButton>
              </Link>
            )}
          </div>
        ) : (
          <Carousel itemsPerView={3} autoPlay={true} autoPlayInterval={5000} showDots={true} accentColor={color} className="px-6">
            {featuredArtworks.map((artwork, idx) => (
              <CarouselItem key={`${artwork.id}-${idx}`}>
                <div onClick={() => router.push(`/artwork/${artwork.id}`)} className="block h-full cursor-pointer">
                  <Card className="group h-full bg-white dark:bg-dark-primary border border-slate-200 dark:border-dark-tertiary hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Imagen grande */}
                    <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100 dark:bg-dark-tertiary">
                      <img
                        src={artwork.imageUrl || artwork.thumbnailUrl || 'https://via.placeholder.com/600x400/e2e8f0/64748b?text=Sin+Imagen'}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/600x400/e2e8f0/64748b?text=Sin+Imagen';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badge categoría */}
                      <div className="absolute top-3 left-3">
                        <UserColorBadge className="shadow-md text-xs">
                          <Palette className="h-3 w-3 mr-1" />
                          {artCategories.find(cat => cat.id === artwork.category)?.name || 'Pintura'}
                        </UserColorBadge>
                      </div>

                      {/* Stats en hover */}
                      <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <span className="inline-flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                          <Heart className="h-3.5 w-3.5 fill-current" />
                          {artwork.likes}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-sky-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                          <Eye className="h-3.5 w-3.5" />
                          {artwork.views}
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <CardContent className="p-4">
                      {/* Título y año */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-nature-600 dark:group-hover:text-nature-400 transition-colors">
                          {artwork.title}
                        </h3>
                        {artwork.year && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap mt-0.5">
                            {artwork.year}
                          </span>
                        )}
                      </div>

                      {/* Descripción */}
                      <p className="text-sm text-slate-500 dark:text-white/80 line-clamp-2 mb-3 leading-relaxed">
                        {artwork.description}
                      </p>

                      {/* Artista y tags */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                          >
                            {artwork.artist.charAt(0).toUpperCase()}
                          </div>
                          {artwork.publishedBy ? (
                            <Link
                              href={`/user/${artwork.publishedBy}`}
                              className="text-sm text-slate-600 dark:text-slate-400 truncate hover:text-nature-600 dark:hover:text-nature-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {artwork.artist}
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {artwork.artist}
                            </span>
                          )}
                        </div>

                        {artwork.tags && artwork.tags.length > 0 && (
                          <div className="flex gap-1 flex-shrink-0">
                            {artwork.tags.slice(0, 1).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-slate-200 dark:border-dark-tertiary">
                                #{tag}
                              </Badge>
                            ))}
                            {artwork.tags.length > 1 && (
                              <Badge variant="outline" className="text-xs border-slate-200 dark:border-dark-tertiary">
                                +{artwork.tags.length - 1}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </Carousel>
        )}

        {/* Botón móvil */}
        <div className="sm:hidden mt-6 text-center">
          <Link href="/catalog">
            <Button
              variant="outline"
              size="sm"
              className="border-2"
              style={{ borderColor: color, color: color }}
            >
              Ver Todo el Catálogo
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtworks;
