import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CategoryShowcase } from '../components/ui/CategoryShowcase';
import { mockArtworks, artCategories, searchArtworks } from '../data/mockData';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  Eye,
  SlidersHorizontal,
  BookOpen,
  Music,
  Video,
  Palette,
  Image,
  Box,
  Sparkles
} from 'lucide-react';

const iconMap = {
  BookOpen,
  Music,
  Video,
  Palette,
  Image,
  Box,
  Sparkles
};

const sortOptions = [
  { value: 'recent', label: 'Más Recientes' },
  { value: 'popular', label: 'Más Populares' },
  { value: 'views', label: 'Más Vistos' },
  { value: 'likes', label: 'Más Likes' },
  { value: 'alphabetical', label: 'Alfabético' }
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let results = searchArtworks(searchQuery, selectedCategory);
      
      switch (sortBy) {
        case 'popular':
          results.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
          break;
        case 'views':
          results.sort((a, b) => b.views - a.views);
          break;
        case 'likes':
          results.sort((a, b) => b.likes - a.likes);
          break;
        case 'alphabetical':
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'recent':
        default:
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
      
      setFilteredArtworks(results);
      setIsLoading(false);
    };

    performSearch();
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, setSearchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('recent');
  };

  const ArtworkCard = ({ artwork, isListView = false }) => {
    const category = artCategories.find(cat => cat.id === artwork.category);
    
    if (isListView) {
      return (
        <Link to={`/artwork/${artwork.id}`}>
          <Card className="card-hover cursor-pointer">
            <div className="flex">
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={artwork.imageUrl || artwork.thumbnailUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover rounded-l-xl"
                />
              </div>
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-slate-900 mb-1">
                      {artwork.title}
                    </h3>
                    <p className="text-slate-600 text-sm">por {artwork.artist}</p>
                  </div>
                  <Badge variant="secondary">{category?.name}</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {artwork.description}
                </p>
                <div className="flex items-center justify-between">
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
                  <div className="flex flex-wrap gap-1">
                    {artwork.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      );
    }

    return (
      <Link to={`/artwork/${artwork.id}`}>
        <Card className="card-hover cursor-pointer h-full">
          <div className="aspect-video w-full overflow-hidden rounded-t-xl">
            <img
              src={artwork.imageUrl || artwork.thumbnailUrl}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg mb-1">{artwork.title}</CardTitle>
                <p className="text-sm text-slate-600">por {artwork.artist}</p>
              </div>
              <Badge variant="secondary">{category?.name}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {artwork.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{artwork.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{artwork.views}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {artwork.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-museum-900 via-nature-800 to-purple-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-white/20 border-white/30 text-white mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Catálogo Completo
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Explora Nuestro
              <span className="block text-transparent bg-gradient-to-r from-nature-300 to-museum-300 bg-clip-text">
                Universo Artístico
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Descubre {mockArtworks.length} obras únicas de artistas talentosos de todo el mundo.
              Filtra, busca y encuentra la inspiración que buscas.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{mockArtworks.length}</div>
                <div className="text-white/80">Obras de Arte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{artCategories.length}</div>
                <div className="text-white/80">Categorías</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.floor(Math.random() * 50 + 150)}
                </div>
                <div className="text-white/80">Artistas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Búsqueda</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar obras, artistas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Categorías</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-nature-100 text-nature-700'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {artCategories.map((category) => {
                    const IconComponent = iconMap[category.icon];
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                          selectedCategory === category.id
                            ? 'bg-nature-100 text-nature-700'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Ordenar por</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(searchQuery || selectedCategory !== 'all') && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                {isLoading ? 'Cargando...' : `${filteredArtworks.length} obras encontradas`}
              </p>
              
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-slate-200 rounded-t-xl"></div>
                    <CardHeader>
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredArtworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    isListView={viewMode === 'list'}
                  />
                ))}
              </div>
            )}

            {!isLoading && filteredArtworks.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Search className="h-12 w-12 text-slate-300 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No se encontraron obras
                </h3>
                <p className="text-slate-600 mb-4">
                  Intenta con otros términos de búsqueda o cambia los filtros.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;