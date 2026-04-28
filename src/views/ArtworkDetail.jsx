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
import FeaturedArtworks from '@/components/ui/FeaturedArtworks';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import { userService } from '@/services/user/userService';
import { toast } from '@/lib/toast';
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
  Box,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';

const CustomXLogo = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
    aria-label="X (formerly Twitter)"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Necesario en pages/ para evitar el prerender estático.
// Sin esto, Next.js intenta renderizar la página en build time,
// donde useColor/useAuth no tienen provider disponible y crashean.
export async function getServerSideProps() {
  return { props: {} };
}

const ArtworkDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { color } = useColor();
  
  const rawParamId = params?.id;
  let type = null;
  let rawId = null;
  if (rawParamId) {
    const parts = String(rawParamId).split('-');
    rawId = parseInt(parts[parts.length - 1], 10);
    type = parts.slice(0, parts.length - 1).join('-');
  }

  const [artwork, setArtwork] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [artistProfile, setArtistProfile] = useState(null);

  useEffect(() => {
    const loadArtwork = async () => {
      if (!rawId) return;

      if (type === 'sculpture') {
        router.replace(`/sculpture/${rawId}`);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await paintService.getById(rawId);

        if (response.success) {
          const paint = response.data;

          const mainImageUrl = getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`;

          const transformedArtwork = {
            id: paint.id,
            title: paint.nombre_pintura,
            artist: paint.artista,
            description: paint.descripcion_pintura,
            category: paint.categoria,
            imageUrl: mainImageUrl,
            thumbnailUrl: mainImageUrl,
            images: paint.images || [mainImageUrl],
            tags: paint.etiqueta ? paint.etiqueta.split(', ') : [],
            techniques: paint.tecnicas ? paint.tecnicas.split(', ') : [],
            createdAt: paint.fecha,
            likes: paint.likes || 0,
            views: paint.views || 0,
            uploadedBy: paint.publicado_por,
            artista_id: paint.artista_id,
            artistId: paint.artista.toLowerCase().replace(/\s+/g, '-')
          };

          setArtwork(transformedArtwork);
          setLikes(paint.likes || 0);

          // Solo usuarios autenticados: registrar vista y verificar like
          if (isAuthenticated) {
            const [likeRes, viewRes] = await Promise.all([
              paintService.getMyLike(paint.id),
              paintService.registerView(paint.id),
            ]);
            if (likeRes.success) setIsLiked(likeRes.data.isLiked);
            if (viewRes.success) {
              setArtwork(prev => ({ ...prev, views: viewRes.data.views }));
            }
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
  }, [rawId, type, router]);

  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (artwork?.artista_id) {
        const res = await userService.getUserProfile(artwork.artista_id);
        if (res.success) {
          setArtistProfile(res.data);
        }
      }
    };
    fetchArtistProfile();
  }, [artwork?.artista_id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    // Optimistic update
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);

    const res = newLiked
      ? await paintService.like(artwork.id)
      : await paintService.unlike(artwork.id);

    if (res.success) {
      // Sincronizar con el valor real del servidor
      setLikes(res.data.likes);
      setIsLiked(res.data.isLiked);
    } else {
      // Revertir si falla
      setIsLiked(!newLiked);
      setLikes(prev => newLiked ? prev - 1 : prev + 1);
    }
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
      toast.success('Enlace copiado al portapapeles');
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
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <UserColorButton
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </UserColorButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 bg-white dark:bg-[#0f0f0f] rounded-xl shadow-[0_0px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0px_20px_rgba(0,0,0,0.2)]">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-4">
                <img
                  src={artwork.images?.[currentImageIndex] || artwork.imageUrl || artwork.thumbnailUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />

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
                  <h1 className="text-3xl font-display font-bold text-slate-900 mb-2 dark:text-white">
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

              <p className="text-slate-700 text-lg leading-relaxed mb-6 dark:text-white">
                {artwork.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {artwork.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm user-color-border user-color-text">
                    #{tag}
                  </Badge>
                ))}
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
                    <div className="flex items-center gap-1 text-slate-600 dark:text-white/80">
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
                  <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                    <Calendar className="h-4 w-4" />
                    <span>Publicado el {formatDate(artwork.createdAt)}</span>
                  </div>

                  {artwork.year && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                      <Palette className="h-4 w-4" />
                      <span>Año: {artwork.year}</span>
                    </div>
                  )}

                  {artwork.dimensions && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                      <ImageIcon className="h-4 w-4" />
                      <span>Dimensiones: {artwork.dimensions}</span>
                    </div>
                  )}

                  {artwork.techniques && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                      <Tag className="h-4 w-4" />
                      <span>Técnicas: {artwork.techniques.join(', ')}</span>
                    </div>
                  )}

                  {artwork.material && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
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
                    src={artistProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artwork.artist}`}
                    alt={artwork.artist}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{artwork.artist}</h3>
                    <p className="text-sm text-slate-600 dark:text-white/80">Artista {artistProfile?.career ? `- ${artistProfile.career}` : ''}</p>
                  </div>
                </div>
                {artwork.uploadedBy && (
                  <div className="mb-3 p-3 bg-slate-50 dark:bg-[#171717] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1 dark:text-white">Publicado por:</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-white">{artwork.uploadedBy}</p>
                  </div>
                )}
                
                {artistProfile?.socialLinks && artistProfile.socialLinks.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {artistProfile.socialLinks.map((link, idx) => {
                      let IconComponent = null;
                      switch(link.platform) {
                        case 'facebook': IconComponent = Facebook; break;
                        case 'instagram': IconComponent = Instagram; break;
                        case 'x': IconComponent = CustomXLogo; break;
                        case 'linkedin': IconComponent = Linkedin; break;
                        default: IconComponent = LinkIcon;
                      }
                      return (
                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#222] dark:hover:bg-[#333] rounded-full transition-colors text-slate-600 dark:text-white/80">
                          <IconComponent className="w-4 h-4" />
                        </a>
                      )
                    })}
                  </div>
                )}

                <p className="text-sm text-slate-600 dark:text-white/80 mb-3">
                  Explora más obras de este talentoso artista en nuestra colección.
                </p>
                <Link href={`/profile/${artwork.artistId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <FeaturedArtworks 
        title="Obras Relacionadas" 
        description="Descubre otras obras que podrían interesarte de nuestra colección. Explora estilos similares y encuentra tu próxima pieza favorita."
      />
    </div>
  );
};

export default ArtworkDetail;