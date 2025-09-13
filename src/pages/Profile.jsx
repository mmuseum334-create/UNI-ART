import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockArtworks } from '../data/mockData';
import { formatDate } from '../lib/utils';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Heart, 
  Eye, 
  Upload,
  Grid3X3,
  List,
  Settings,
  Save,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('my-works');

  const userArtworks = mockArtworks.filter(artwork => artwork.artist === user?.name);
  const favoriteArtworks = mockArtworks.filter(artwork => artwork.isLiked);

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

  const ArtworkGrid = ({ artworks }) => (
    <div className={
      viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
    }>
      {artworks.map((artwork) => (
        <Link key={artwork.id} to={`/artwork/${artwork.id}`}>
          <Card className="card-hover cursor-pointer h-full">
            {viewMode === 'grid' ? (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                  <img
                    src={artwork.imageUrl || artwork.thumbnailUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{artwork.title}</CardTitle>
                  <p className="text-sm text-slate-600">{artwork.category}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{artwork.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{artwork.views}</span>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex p-4">
                <img
                  src={artwork.imageUrl || artwork.thumbnailUrl}
                  alt={artwork.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-slate-900">{artwork.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{artwork.category}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{artwork.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{artwork.views}</span>
                    </div>
                    <span>{formatDate(artwork.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Link>
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
                      <h1 className="text-2xl font-display font-bold text-slate-900">
                        {user?.name}
                      </h1>
                      <p className="text-slate-600 mb-4">{user?.email}</p>
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
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {formatDate(user?.joinedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{user?.isArtist ? 'Artista' : 'Visitante'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Obras:</span>
                      <span className="font-medium">{stats.artworks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Likes totales:</span>
                      <span className="font-medium">{stats.totalLikes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vistas totales:</span>
                      <span className="font-medium">{stats.totalViews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Favoritos:</span>
                      <span className="font-medium">{stats.favorites}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Link to="/upload">
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
                          ? 'bg-nature-100 text-nature-700'
                          : 'text-slate-600 hover:bg-slate-100'
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
                  {userArtworks.length > 0 ? (
                    <ArtworkGrid artworks={userArtworks} />
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
                        <Link to="/upload">
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
                  {favoriteArtworks.length > 0 ? (
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
                        <Link to="/catalog">
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
                        <h3 className="font-medium text-slate-900 mb-3">Información Personal</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Nombre completo
                            </label>
                            <Input value={user?.name} readOnly />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Email
                            </label>
                            <Input value={user?.email} readOnly />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-slate-900 mb-3">Preferencias</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notificaciones por email</p>
                              <p className="text-sm text-slate-600">Recibir actualizaciones sobre tu cuenta</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Configurar
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Privacidad del perfil</p>
                              <p className="text-sm text-slate-600">Controla quién puede ver tu perfil</p>
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
    </div>
  );
};

export default Profile;