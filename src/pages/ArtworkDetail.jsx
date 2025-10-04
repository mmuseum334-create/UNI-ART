/**
 * ArtworkDetail page - Displays detailed view of a single artwork
 * Shows artwork content, metadata, artist info, and related works
 */
'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { mockArtworks, artCategories } from '@/data/mockData';
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

  // Manejo seguro de useAuth para SSR
  let user = null;
  let isAuthenticated = false;

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    // Durante SSR, useAuth puede fallar - es OK
    console.log('Auth not available during SSR');
  }
  const id = params?.id;
  const [artwork, setArtwork] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    const foundArtwork = mockArtworks.find(art => art.id === id);
    if (foundArtwork) {
      setArtwork(foundArtwork);
      setIsLiked(foundArtwork.isLiked);
      setLikes(foundArtwork.likes);
    }
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

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Obra no encontrada</h2>
          <p className="text-slate-600 mb-4">La obra que buscas no existe.</p>
          <Link href="/catalog">
            <Button>Volver al catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = artCategories.find(cat => cat.id === artwork.category);
  const relatedArtworks = mockArtworks
    .filter(art => art.id !== artwork.id && art.category === artwork.category)
    .slice(0, 3);

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
              <div className="aspect-video w-full overflow-hidden rounded-xl mb-4">
                <img
                  src={artwork.imageUrl || artwork.thumbnailUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
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
                <Badge variant="info" className="text-lg px-3 py-1">
                  {category?.name}
                </Badge>
              </div>

              <p className="text-slate-700 text-lg leading-relaxed mb-6">
                {artwork.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {artwork.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
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
                <p className="text-sm text-slate-600 mb-3">
                  Artista apasionado por explorar nuevas formas de expresión creativa.
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