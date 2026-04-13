/**
 * Profile page - Displays user profile, artworks, and settings
 * Shows user statistics, uploaded works, favorites, and account configuration
 */
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getPublicImageUrl } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { paintService } from '@/services/paint/paintService';
import { toast } from '@/lib/toast';
import { useConfirm } from '@/components/admin/AdminShell';
import EditPaintingModal from '@/components/ui/EditPaintingModal';
import {
  User,
  Calendar,
  Edit,
  Heart,
  Eye,
  Upload,
  Grid3X3,
  List,
  Settings,
  Save,
  X,
  Trash2
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('my-works');
  const [userArtworks, setUserArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPainting, setEditingPainting] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [favoriteArtworks, setFavoriteArtworks] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Cargar las pinturas del usuario
  useEffect(() => {
    const loadUserPaintings = async () => {
      setIsLoading(true);
      setError(null);

      const result = await paintService.getMyPaintings();

      if (result.success) {
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedPaintings = (result.data || []).map(painting => ({
          id: painting.id,
          imagen: painting.img_pintura, // Mapear img_pintura a imagen
          nombre: painting.nombre_pintura, // Mapear nombre_pintura a nombre
          categoria: painting.categoria,
          artista: painting.artista,
          fechaCreacion: painting.created_at, // Mapear created_at a fechaCreacion
          likes: painting.likes || 0,
          views: painting.views || 0,
          // Incluir todos los datos originales para el modal de edición
          img_pintura: painting.img_pintura,
          nombre_pintura: painting.nombre_pintura,
          descripcion_pintura: painting.descripcion_pintura,
          fecha: painting.fecha,
          tecnicas: painting.tecnicas,
          etiqueta: painting.etiqueta,
          publicado_por: painting.publicado_por
        }));
        setUserArtworks(mappedPaintings);
      } else {
        setError(result.error);
        console.error('Error al cargar pinturas:', result.error);
      }

      setIsLoading(false);
    };

    if (user) {
      loadUserPaintings();
    }
  }, [user]);

  // Cargar favoritos al montar (para que el contador sea correcto desde el inicio)
  useEffect(() => {
    if (!user) return;
    const loadFavorites = async () => {
      setIsLoadingFavorites(true);
      const result = await paintService.getMyLikes();
      if (result.success) {
        setFavoriteArtworks((result.data || []).map(p => ({
          id: p.id,
          imagen: getPublicImageUrl(p.img_pintura) || p.img_pintura,
          nombre: p.nombre_pintura,
          categoria: p.categoria,
          artista: p.artista,
          fechaCreacion: p.created_at,
          likes: p.likes || 0,
          views: p.views || 0,
          descripcion_pintura: p.descripcion_pintura,
        })));
      }
      setIsLoadingFavorites(false);
    };
    loadFavorites();
  }, [user]);

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleEditPainting = (painting) => {
    setEditingPainting(painting);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPainting(null);
  };

  const handleSavePainting = async (_updatedPainting) => {
    // Recargar las pinturas del usuario después de guardar
    const result = await paintService.getMyPaintings();
    if (result.success) {
      const mappedPaintings = (result.data || []).map(painting => ({
        id: painting.id,
        imagen: painting.img_pintura,
        nombre: painting.nombre_pintura,
        categoria: painting.categoria,
        artista: painting.artista,
        fechaCreacion: painting.created_at,
        likes: painting.likes || 0,
        views: painting.views || 0,
        // Incluir todos los datos originales para el modal de edición
        img_pintura: painting.img_pintura,
        nombre_pintura: painting.nombre_pintura,
        descripcion_pintura: painting.descripcion_pintura,
        fecha: painting.fecha,
        tecnicas: painting.tecnicas,
        etiqueta: painting.etiqueta,
        publicado_por: painting.publicado_por
      }));
      setUserArtworks(mappedPaintings);
    }
  };

  const handleDeletePainting = async (paintingId) => {
    const ok = await confirm('¿Estás seguro de que deseas eliminar esta pintura? Esta acción no se puede deshacer.');
    if (!ok) return;

    const result = await paintService.delete(paintingId);
    if (result.success) {
      setUserArtworks(prev => prev.filter(p => p.id !== paintingId));
      toast.success('Pintura eliminada', 'La obra fue eliminada de tu perfil.');
    } else {
      toast.error('Error al eliminar', result.error);
    }
  };

  const stats = {
    artworks: userArtworks.length,
    totalLikes: userArtworks.reduce((sum, artwork) => sum + artwork.likes, 0),
    totalViews: userArtworks.reduce((sum, artwork) => sum + artwork.views, 0),
    favorites: favoriteArtworks.length
  };

  const tabs = [
    { id: 'my-works', label: 'Mis Obras', count: stats.artworks },
    { id: 'favorites', label: 'Favoritos', count: stats.favorites },
    { id: 'settings', label: 'Configuración' }
  ];

  const ArtworkGrid = ({ artworks, showActions = false }) => (
    <div className={
      viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
    }>
      {artworks.map((artwork) => (
        <Card key={artwork.id} className="card-hover h-full relative group">
          {viewMode === 'grid' ? (
            <>
              <Link href={`/artwork/${artwork.id}`}>
                <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                  <img
                    src={artwork.imagen || artwork.imageUrl || artwork.thumbnailUrl}
                    alt={artwork.nombre || artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link href={`/artwork/${artwork.id}`} className="flex-1">
                    <CardTitle className="text-lg">{artwork.nombre || artwork.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-white/60">{artwork.categoria || artwork.category}</p>
                  </Link>
                  {showActions && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditPainting(artwork);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeletePainting(artwork.id);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {artwork.descripcion_pintura && (
                  <p className="text-sm text-slate-600 dark:text-white/60 mb-3 line-clamp-2">
                    {artwork.descripcion_pintura}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
                    <Heart className="h-3 w-3 fill-current" />{artwork.likes || 0}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full">
                    <Eye className="h-3 w-3" />{artwork.views || 0}
                  </span>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex p-4">
              <Link href={`/artwork/${artwork.id}`}>
                <img
                  src={artwork.imagen || artwork.imageUrl || artwork.thumbnailUrl}
                  alt={artwork.nombre || artwork.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </Link>
              <div className="ml-4 flex-1">
                <Link href={`/artwork/${artwork.id}`}>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{artwork.nombre || artwork.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">{artwork.categoria || artwork.category}</p>
                  {artwork.descripcion_pintura && (
                    <p className="text-sm text-slate-500 dark:text-white/40 mt-1 line-clamp-1">
                      {artwork.descripcion_pintura}
                    </p>
                  )}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
                    <Heart className="h-3 w-3 fill-current" />{artwork.likes || 0}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full">
                    <Eye className="h-3 w-3" />{artwork.views || 0}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-white/30">{formatDate(artwork.fechaCreacion || artwork.createdAt)}</span>
                </div>
              </div>
              {showActions && (
                <div className="flex gap-2 items-start">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditPainting(artwork);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeletePainting(artwork.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="text-center"
                      />
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="text-center"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                        {user?.name}
                      </h1>
                      <p className="text-slate-600 dark:text-white/60 mb-4">{user?.email}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    </>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {formatDate(user?.joinedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                    <User className="h-4 w-4" />
                    <span>{user?.isArtist ? 'Artista' : 'Visitante'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/60">Obras:</span>
                      <span className="font-medium dark:text-white">{stats.artworks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/60">Likes totales:</span>
                      <span className="font-medium dark:text-white">{stats.totalLikes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/60">Vistas totales:</span>
                      <span className="font-medium dark:text-white">{stats.totalViews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/60">Favoritos:</span>
                      <span className="font-medium dark:text-white">{stats.favorites}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                  <Link href="/upload">
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Nueva Obra
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-nature-100 text-nature-700 dark:bg-nature-700/20 dark:text-nature-400'
                          : 'text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <Badge variant="secondary" className="ml-2">
                          {tab.count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                {(activeTab === 'my-works' || activeTab === 'favorites') && (
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
                )}
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === 'my-works' && (
                <div>
                  {isLoading ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Cargando tus obras...</p>
                      </CardContent>
                    </Card>
                  ) : error ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="text-red-500 mb-4">
                          <X className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Error al cargar tus obras
                        </h3>
                        <p className="text-slate-600 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                          Reintentar
                        </Button>
                      </CardContent>
                    </Card>
                  ) : userArtworks.length > 0 ? (
                    <ArtworkGrid artworks={userArtworks} showActions={true} />
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          No tienes obras aún
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Comparte tu primera obra con la comunidad
                        </p>
                        <Link href="/upload">
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Primera Obra
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  {isLoadingFavorites ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Cargando favoritos...</p>
                      </CardContent>
                    </Card>
                  ) : favoriteArtworks.length > 0 ? (
                    <ArtworkGrid artworks={favoriteArtworks} />
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          No tienes favoritos aún
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Explora el catálogo y guarda las obras que más te gusten
                        </p>
                        <Link href="/catalog">
                          <Button variant="outline">
                            Explorar Catálogo
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuración de Cuenta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white mb-3">Información Personal</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1">
                              Nombre completo
                            </label>
                            <Input value={user?.name} readOnly />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1">
                              Email
                            </label>
                            <Input value={user?.email} readOnly />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white mb-3">Preferencias</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notificaciones por email</p>
                              <p className="text-sm text-slate-600 dark:text-white">Recibir actualizaciones sobre tu cuenta</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Configurar
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Privacidad del perfil</p>
                              <p className="text-sm text-slate-600 dark:text-white">Controla quién puede ver tu perfil</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Configurar
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <Button variant="destructive">
                          Eliminar Cuenta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición de pintura */}
      <EditPaintingModal
        painting={editingPainting}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSavePainting}
      />
      <ConfirmDialog />
    </div>
  );
};

export default Profile;