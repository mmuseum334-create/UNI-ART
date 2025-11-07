/**
 * ArtworkDetail page - Displays detailed view of a single artwork
 * Shows artwork content, metadata, artist info, and related works
 */
'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useColor } from '@/contexts/ColorContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserColorBadge, UserColorButton } from '@/components/ui/UserColorElements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import { getPublicImageUrl } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import {
  Heart,
  Eye,
  Share2,
  Download,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Palette,
  Music,
  Video,
  FileText,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  Box
} from 'lucide-react';

const ArtworkDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { color } = useColor();
  const id = params?.id;
  const [artwork, setArtwork] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [relatedArtworks, setRelatedArtworks] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadArtwork = async () => {
      if (!id) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await paintService.getById(id);

        if (response.success) {
          const paint = response.data;

          // Transformar datos del backend al formato esperado
          const mainImageUrl = getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`;

          const transformedArtwork = {
            id: paint.id,
            title: paint.nombre_pintura,
            artist: paint.artista,
            description: paint.descripcion_pintura,
            category: paint.categoria,
            imageUrl: mainImageUrl,
            thumbnailUrl: mainImageUrl,
            // Soporte para múltiples imágenes (si el backend las proporciona)
            images: paint.images || [mainImageUrl],
            tags: paint.etiqueta ? paint.etiqueta.split(', ') : [],
            techniques: paint.tecnicas ? paint.tecnicas.split(', ') : [],
            createdAt: paint.fecha,
            likes: 0,
            views: 0,
            uploadedBy: paint.publicado_por,
            artistId: paint.artista.toLowerCase().replace(/\s+/g, '-')
          };

          setArtwork(transformedArtwork);
          setIsLiked(false);
          setLikes(0);

          // Cargar obras relacionadas por categoría
          const relatedResponse = await paintService.getByCategory(paint.categoria);
          if (relatedResponse.success) {
            const related = relatedResponse.data
              .filter(p => p.id !== paint.id)
              .slice(0, 3)
              .map(p => ({
                id: p.id,
                title: p.nombre_pintura,
                artist: p.artista,
                imageUrl: getPublicImageUrl(p.img_pintura) || `http://localhost:3002${p.img_pintura}`,
                thumbnailUrl: getPublicImageUrl(p.img_pintura) || `http://localhost:3002${p.img_pintura}`,
                likes: 0,
                views: 0
              }));
            setRelatedArtworks(related);
          }
        } else {
          setLoadError(response.error || 'No se pudo cargar la pintura');
        }
      } catch (error) {
        console.error('Error cargando pintura:', error);
        setLoadError('Error de conexión al cargar la pintura');
      } finally {
        setIsLoading(false);
      }
    };

    loadArtwork();
  }, [id]);

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: `Mira esta obra de arte: ${artwork.title} por ${artwork.artist}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando pintura...</p>
        </div>
      </div>
    );
  }

  if (loadError || !artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {loadError || 'Obra no encontrada'}
          </h2>
          <p className="text-slate-600 mb-4">
            {loadError ? 'Hubo un problema al cargar la pintura.' : 'La obra que buscas no existe.'}
          </p>
          <Link href="/catalog">
            <Button>Volver al catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = artCategories.find(cat => cat.id === artwork.category);

  const renderContent = () => {
    switch (artwork.category) {
      case 'poems':
        return (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenido del Poema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap font-serif text-slate-700 leading-relaxed">
                  {artwork.content}
                </pre>
              </div>
              {artwork.style && (
                <div className="mt-4 flex gap-2">
                  <Badge variant="outline">Estilo: {artwork.style}</Badge>
                  {artwork.length && <Badge variant="outline">{artwork.length}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'songs':
        return (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Canción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artwork.audioUrl && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1 bg-slate-200 h-2 rounded">
                        <div className="bg-nature-500 h-2 rounded w-1/3"></div>
                      </div>
                      <Volume2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Audio no disponible en demo</p>
                  </div>
                )}
                
                {artwork.lyrics && (
                  <div>
                    <h4 className="font-medium mb-2">Letra:</h4>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-slate-700">
                        {artwork.lyrics}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {artwork.genre && <Badge variant="outline">Género: {artwork.genre}</Badge>}
                  {artwork.duration && <Badge variant="outline">Duración: {artwork.duration}</Badge>}
                  {artwork.instruments && artwork.instruments.map(instrument => (
                    <Badge key={instrument} variant="outline">{instrument}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'videos':
        return (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={artwork.thumbnailUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-600">Video no disponible en demo</p>
                
                <div className="flex flex-wrap gap-2">
                  {artwork.duration && <Badge variant="outline">Duración: {artwork.duration}</Badge>}
                  {artwork.format && <Badge variant="outline">{artwork.format}</Badge>}
                  {artwork.technique && <Badge variant="outline">{artwork.technique}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-4">
                <img
                  src={artwork.images?.[currentImageIndex] || artwork.imageUrl || artwork.thumbnailUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />

                {/* Indicadores de navegación - Solo mostrar si hay múltiples imágenes */}
                {artwork.images && artwork.images.length > 1 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    {artwork.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'scale-125'
                            : 'bg-white/70 hover:bg-white'
                        }`}
                        style={index === currentImageIndex ? { background: 'var(--user-color)' } : {}}
                        aria-label={`Ver imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                    {artwork.title}
                  </h1>
                  <Link
                    href={`/profile/${artwork.artistId}`}
                    className="text-lg text-nature-600 hover:text-nature-700 font-medium"
                  >
                    por {artwork.artist}
                  </Link>
                </div>
                <UserColorBadge className="text-lg px-3 py-1">
                  {category?.name}
                </UserColorBadge>
              </div>

              <p className="text-slate-700 text-lg leading-relaxed mb-6">
                {artwork.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {artwork.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm user-color-border user-color-text">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: color }}
                >
                  <Palette className="h-4 w-4" />
                  Ver pintura
                </button>
                <Link href={`/profile/${artwork.artistId || artwork.uploadedBy}`}>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-transparent border-2 transition-all duration-200 hover:text-white"
                    style={{
                      borderColor: color,
                      color: color
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = color;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = color;
                    }}
                  >
                    <User className="h-4 w-4" />
                    Artista
                  </button>
                </Link>
              </div>
            </div>

            {renderContent()}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      onClick={handleLike}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {likes}
                    </Button>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Eye className="h-4 w-4" />
                      <span>{artwork.views}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Publicado el {formatDate(artwork.createdAt)}</span>
                  </div>
                  
                  {artwork.year && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Palette className="h-4 w-4" />
                      <span>Año: {artwork.year}</span>
                    </div>
                  )}

                  {artwork.dimensions && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <ImageIcon className="h-4 w-4" />
                      <span>Dimensiones: {artwork.dimensions}</span>
                    </div>
                  )}

                  {artwork.techniques && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tag className="h-4 w-4" />
                      <span>Técnicas: {artwork.techniques.join(', ')}</span>
                    </div>
                  )}

                  {artwork.material && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Box className="h-4 w-4" />
                      <span>Material: {artwork.material}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Sobre el Artista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artwork.artist}`}
                    alt={artwork.artist}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-slate-900">{artwork.artist}</h3>
                    <p className="text-sm text-slate-600">Artista</p>
                  </div>
                </div>
                {artwork.uploadedBy && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Publicado por:</p>
                    <p className="text-sm font-medium text-slate-700">{artwork.uploadedBy}</p>
                  </div>
                )}
                <p className="text-sm text-slate-600 mb-3">
                  Explora más obras de este talentoso artista en nuestra colección.
                </p>
                <Link href={`/profile/${artwork.artistId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {relatedArtworks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Obras Relacionadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedArtworks.map((related) => (
                      <Link key={related.id} href={`/artwork/${related.id}`}>
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <img
                            src={related.imageUrl || related.thumbnailUrl}
                            alt={related.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-slate-900 truncate">
                              {related.title}
                            </h4>
                            <p className="text-xs text-slate-600">{related.artist}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Heart className="h-3 w-3" />
                                <span>{related.likes}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Eye className="h-3 w-3" />
                                <span>{related.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;