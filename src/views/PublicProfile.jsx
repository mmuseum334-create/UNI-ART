/**
 * PublicProfile page - Displays public profile of other users
 * Shows user information, statistics, and their uploaded artworks
 */
'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { userService } from '@/services/user/userService';
import { formatDate } from '@/lib/utils';
import {
  User,
  Calendar,
  Heart,
  Eye,
  Grid3X3,
  List,
  ArrowLeft,
  Mail,
  MapPin,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

const XLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const parseSocialLinks = (links) => {
  if (!links) return [];
  if (typeof links === 'string') {
    try {
      if (links.trim().startsWith('[')) {
        return JSON.parse(links);
      }
      return links.split('\n').filter(l => l.trim()).map(url => {
        let platform = 'default';
        if (url.includes('facebook.com')) platform = 'facebook';
        else if (url.includes('instagram.com')) platform = 'instagram';
        else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'twitter';
        else if (url.includes('linkedin.com')) platform = 'linkedin';
        return { platform, url: url.trim() };
      });
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(links) ? links : [];
};

const SocialIcon = ({ platform, className }) => {
  switch (platform) {
    case 'facebook': return <Facebook className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'twitter': return <XLogo className={className} />;
    case 'linkedin': return <Linkedin className={className} />;
    default: return <ExternalLink className={className} />;
  }
};

const PublicProfile = ({ userId }) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState(null);
  const [userArtworks, setUserArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Cargar perfil del usuario y sus pinturas
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Cargar perfil del usuario
        const profileResult = await userService.getUserProfile(userId);

        if (profileResult.success) {
          setProfileUser(profileResult.data);
        } else {
          setError(profileResult.error);
        }

        // Cargar pinturas del usuario
        const paintingsResult = await userService.getUserPaintings(userId);

        if (paintingsResult.success) {
          // Mapear los datos del backend al formato esperado por el frontend
          const mappedPaintings = (paintingsResult.data || []).map(painting => ({
            id: painting.id,
            imagen: painting.img_pintura,
            nombre: painting.nombre_pintura,
            categoria: painting.categoria,
            artista: painting.artista,
            descripcion_pintura: painting.descripcion_pintura,
            fechaCreacion: painting.created_at,
            likes: painting.likes || 0,
            views: painting.views || 0,
            fecha: painting.fecha,
            tecnicas: painting.tecnicas,
            etiqueta: painting.etiqueta
          }));
          setUserArtworks(mappedPaintings);
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setError('Error al cargar el perfil del usuario');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const stats = {
    artworks: userArtworks.length,
    totalLikes: userArtworks.reduce((sum, artwork) => sum + artwork.likes, 0),
    totalViews: userArtworks.reduce((sum, artwork) => sum + artwork.views, 0)
  };

  const ArtworkGrid = ({ artworks }) => (
    <div className={
      viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
    }>
      {artworks.map((artwork) => (
        <Card key={artwork.id} className="card-hover h-full group">
          {viewMode === 'grid' ? (
            <>
              <Link href={`/artwork/${artwork.id}`}>
                <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                  <img
                    src={artwork.imagen || 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen'}
                    alt={artwork.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen';
                    }}
                  />
                </div>
              </Link>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link href={`/artwork/${artwork.id}`} className="flex-1">
                    <CardTitle className="text-lg hover:text-nature-600 dark:hover:text-nature-400 transition-colors">
                      {artwork.nombre}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {artwork.categoria}
                    </p>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {artwork.descripcion_pintura && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                    {artwork.descripcion_pintura}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{artwork.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{artwork.views}</span>
                  </div>
                </div>
                {artwork.etiqueta && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {artwork.etiqueta.split(',').slice(0, 3).map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-slate-50 dark:bg-dark-tertiary"
                      >
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex p-4">
              <Link href={`/artwork/${artwork.id}`}>
                <img
                  src={artwork.imagen || 'https://via.placeholder.com/80x80/e2e8f0/64748b?text=Sin+Imagen'}
                  alt={artwork.nombre}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80x80/e2e8f0/64748b?text=Sin+Imagen';
                  }}
                />
              </Link>
              <div className="ml-4 flex-1">
                <Link href={`/artwork/${artwork.id}`}>
                  <h3 className="font-semibold text-slate-900 dark:text-white hover:text-nature-600 dark:hover:text-nature-400 transition-colors">
                    {artwork.nombre}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{artwork.categoria}</p>
                  {artwork.descripcion_pintura && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {artwork.descripcion_pintura}
                    </p>
                  )}
                </Link>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{artwork.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{artwork.views}</span>
                  </div>
                  <span>{formatDate(artwork.fechaCreacion)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 dark:border-nature-400 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Cargando perfil...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-20">
              <div className="text-red-500 dark:text-red-400 mb-4">
                <User className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Error al cargar el perfil
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-20">
              <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Usuario no encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                El usuario que buscas no existe o ha sido eliminado
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si es el perfil del usuario actual, redirigir a su perfil
  if (currentUser && currentUser.id === profileUser.id) {
    router.push('/profile');
    return null;
  }

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón de volver */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con información del usuario */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {/* Avatar del usuario */}
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-nature-400 to-museum-500 flex items-center justify-center">
                    {profileUser.avatar ? (
                      <img
                        src={profileUser.avatar}
                        alt={profileUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {profileUser.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">
                    {profileUser.name}
                  </h1>

                  {(profileUser.career || profileUser.carrera) && (
                    <p className="text-sm font-medium text-nature-600 dark:text-nature-400 mb-2">
                      {profileUser.career || profileUser.carrera} 
                      {(profileUser.semester || profileUser.semestre) && ` - Semestre ${profileUser.semester || profileUser.semestre}`}
                    </p>
                  )}

                  {profileUser.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {profileUser.bio}
                    </p>
                  )}
                </div>

                {/* Información adicional */}
                <div className="space-y-3 text-sm mb-6">
                  {profileUser.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{profileUser.email}</span>
                    </div>
                  )}

                  {profileUser.location && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {formatDate(profileUser.created_at || profileUser.joinedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4" />
                    <span>{profileUser.isArtist ? 'Artista' : 'Visitante'}</span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="pt-6 border-t border-slate-200 dark:border-dark-tertiary">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Obras publicadas:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.artworks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Likes totales:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.totalLikes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Vistas totales:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.totalViews}</span>
                    </div>
                  </div>
                </div>

                {/* Enlaces adicionales si existen */}
                {(profileUser.website || profileUser.social_links || profileUser.socialLinks) && (
                  <div className="pt-6 border-t border-slate-200 dark:border-dark-tertiary">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Enlaces</h3>
                    <div className="space-y-3">
                      {profileUser.website && (
                        <a
                          href={profileUser.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-nature-600 dark:text-nature-400 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Sitio web
                        </a>
                      )}
                      
                      {(profileUser.socialLinks || profileUser.social_links) && parseSocialLinks(profileUser.socialLinks || profileUser.social_links).length > 0 && (
                        <div className="flex flex-col gap-2">
                          {parseSocialLinks(profileUser.socialLinks || profileUser.social_links).map((link, idx) => {
                            const href = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                            return (
                              <a 
                                key={idx} 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-sm text-nature-600 dark:text-nature-400 hover:underline break-all"
                              >
                                <SocialIcon platform={link.platform} className="h-4 w-4 shrink-0" />
                                {link.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal - Obras del usuario */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                    Obras de {profileUser.name}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    {stats.artworks} {stats.artworks === 1 ? 'obra publicada' : 'obras publicadas'}
                  </p>
                </div>

                {/* Controles de vista */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid de obras */}
            {userArtworks.length > 0 ? (
              <ArtworkGrid artworks={userArtworks} />
            ) : (
              <Card>
                <CardContent className="text-center py-20">
                  <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Sin obras aún
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Este usuario aún no ha publicado ninguna obra
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
