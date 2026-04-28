/**
 * Profile page - Displays user profile, artworks, and settings
 * Shows user statistics, uploaded works, favorites, and account configuration
 */
'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getPublicImageUrl } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { paintService } from '@/services/paint/paintService';
import { userService } from '@/services/user/userService';
import { toast } from '@/lib/toast';
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
  Trash2,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  Plus,
  ChevronDown,
  Leaf,
  Wheat,
  Settings as CogIcon,
  Factory,
  PawPrint,
  Mic,
  Palette,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const XLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const CustomSelect = ({ value, onChange, options, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <div 
        className="flex items-center justify-between h-10 w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-nature-400 dark:text-slate-50 transition-colors shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <>
              {selectedOption.icon && <selectedOption.icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />}
              <span className="text-sm truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-sm text-slate-400 truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${value === opt.value ? 'bg-nature-50 dark:bg-nature-900/30 text-nature-700 dark:text-nature-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.icon && <opt.icon className="w-4 h-4 shrink-0" />}
              <span className="truncate">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const careerOptions = [
  { value: "Ingeniería Ambiental", label: "Ingeniería Ambiental", icon: Leaf },
  { value: "Ingeniería Agronómica", label: "Ingeniería Agronómica", icon: Wheat },
  { value: "Ingeniería de Producción", label: "Ingeniería de Producción", icon: CogIcon },
  { value: "Ingeniería Agroindustrial", label: "Ingeniería Agroindustrial", icon: Factory },
  { value: "Medicina Veterinaria y Zootecnia", label: "Medicina Veterinaria y Zootecnia", icon: PawPrint },
  { value: "Trabajo Social", label: "Trabajo Social", icon: User },
  { value: "Comunicación Social", label: "Comunicación Social", icon: Mic },
  { value: "Licenciatura en Artes", label: "Licenciatura en Artes", icon: Palette },
  { value: "Otra", label: "Otra", icon: Briefcase }
];

const semesterOptions = [
  ...Array.from({length: 10}, (_, i) => ({ value: (i + 1).toString(), label: `Semestre ${i + 1}`, icon: Calendar })),
  { value: "Egresado", label: "Egresado", icon: GraduationCap },
  { value: "Profesor", label: "Profesor", icon: Briefcase }
];

const socialPlatformOptions = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "X", icon: XLogo },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "default", label: "Otra", icon: ExternalLink }
];

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

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    career: user?.career || '',
    semester: user?.semester || '',
    socialLinks: parseSocialLinks(user?.socialLinks),
    avatar: user?.avatar || ''
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

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...editData,
        socialLinks: JSON.stringify(editData.socialLinks)
      };
      
      // Intentar guardar en backend si el usuario tiene ID
      if (user?.id) {
        const result = await userService.update(user.id, dataToSave);
        if (result.success) {
          updateProfile(dataToSave);
          toast.success("Perfil actualizado", "Tus datos se han guardado correctamente.");
          setIsProfileModalOpen(false);
        } else {
          toast.error("Error al actualizar", result.error || "No se pudo actualizar el perfil.");
        }
      } else {
        // Fallback si no hay ID por alguna razón
        updateProfile(dataToSave);
        toast.success("Perfil actualizado", "Tus datos se han guardado localmente.");
        setIsProfileModalOpen(false);
      }
    } catch (error) {
      toast.error("Error", "Ocurrió un problema al guardar tu perfil.");
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      career: user?.career || '',
      semester: user?.semester || '',
      socialLinks: parseSocialLinks(user?.socialLinks),
      avatar: user?.avatar || ''
    });
    setIsProfileModalOpen(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocialLink = () => {
    setEditData({
      ...editData,
      socialLinks: [...editData.socialLinks, { platform: 'instagram', url: '' }]
    });
  };

  const updateSocialLink = (index, field, value) => {
    const newLinks = [...editData.socialLinks];
    newLinks[index][field] = value;
    setEditData({ ...editData, socialLinks: newLinks });
  };

  const removeSocialLink = (index) => {
    const newLinks = editData.socialLinks.filter((_, i) => i !== index);
    setEditData({ ...editData, socialLinks: newLinks });
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

  const handleDeletePainting = (paintingId) => {
    toast.confirm(
      '¿Eliminar esta pintura?',
      'Confirma para eliminar. Ignora para cancelar.',
      async () => {
        const result = await paintService.delete(paintingId);
        if (result.success) {
          setUserArtworks(prev => prev.filter(p => p.id !== paintingId));
          toast.success('Pintura eliminada', 'La obra fue eliminada de tu perfil.');
        } else {
          toast.error('Error al eliminar', result.error);
        }
      }
    );
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
    <div className="min-h-screen mt-24">
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
                  <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                    {user?.name}
                  </h1>
                  <p className="text-slate-600 dark:text-white/60 mb-2">{user?.email}</p>
                  
                  {user?.career && (
                    <p className="text-sm text-nature-600 dark:text-nature-400 font-medium mb-1">
                      {user.career} {user?.semester && `- Semestre ${user.semester}`}
                    </p>
                  )}
                  
                  {user?.socialLinks && parseSocialLinks(user.socialLinks).length > 0 && (
                    <div className="mt-3 mb-4 flex justify-center gap-2 flex-wrap">
                      {parseSocialLinks(user.socialLinks).map((link, idx) => {
                        const href = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                        return (
                          <a 
                            key={idx} 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-nature-600 dark:hover:text-nature-400 transition-colors"
                            title={link.url}
                          >
                            <SocialIcon platform={link.platform} className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEditData({
                        name: user?.name || '',
                        email: user?.email || '',
                        career: user?.career || '',
                        semester: user?.semester || '',
                        socialLinks: parseSocialLinks(user?.socialLinks),
                        avatar: user?.avatar || ''
                      });
                      setIsProfileModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
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

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-xl min-h-[75vh] max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-8 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-6 text-left flex-1">
                {/* Avatar Edit - Top */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer mb-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md">
                      <img 
                        src={editData.avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium text-center leading-tight">Cambiar<br/>Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 text-center">Una buena foto te ayudará a destacar en la comunidad.</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      placeholder="Tu nombre completo"
                      className="focus:ring-nature-400 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Carrera</label>
                    <CustomSelect 
                      value={editData.career}
                      onChange={(val) => setEditData({...editData, career: val})}
                      options={careerOptions}
                      placeholder="Selecciona tu carrera"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semestre</label>
                    <CustomSelect 
                      value={editData.semester}
                      onChange={(val) => setEditData({...editData, semester: val})}
                      options={semesterOptions}
                      placeholder="Selecciona tu semestre"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Redes Sociales</label>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="h-8 text-xs py-0 border-nature-200 text-nature-700 hover:bg-nature-50 dark:border-nature-800 dark:text-nature-400 dark:hover:bg-nature-900/30">
                      <Plus className="w-3 h-3 mr-1" /> Agregar Red
                    </Button>
                  </div>
                  
                  {editData.socialLinks.length === 0 ? (
                    <div className="text-sm text-slate-500 italic text-center p-4 border border-dashed rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      No has agregado redes sociales.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editData.socialLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <CustomSelect
                            value={link.platform}
                            onChange={(val) => updateSocialLink(idx, 'platform', val)}
                            options={socialPlatformOptions}
                            placeholder="Red"
                            className="w-[140px] shrink-0"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                            placeholder="Ej. https://instagram.com/tu_usuario"
                            className="flex-1 h-10 border-slate-300 dark:border-slate-700 shadow-sm"
                          />
                          <Button type="button" variant="ghost" onClick={() => removeSocialLink(idx)} className="h-10 w-10 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
                  <Button onClick={handleSave} className="flex-1">
                    Guardar Cambios
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Profile;