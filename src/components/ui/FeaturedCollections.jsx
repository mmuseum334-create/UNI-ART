import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Folder, ArrowRight, Clock, Eye, Heart, Users, Sparkles } from 'lucide-react';

const mockCollections = [
  {
    id: 1,
    title: "Arte Digital Contemporáneo",
    description: "Una selección cuidada de las mejores obras digitales de artistas emergentes",
    curator: "Elena Martínez",
    artworks: 24,
    views: 15600,
    likes: 892,
    followers: 1240,
    thumbnail: "/api/placeholder/400/250",
    featured: true,
    color: "from-purple-600 to-pink-600",
    artworkPreviews: [
      "/api/placeholder/80/80",
      "/api/placeholder/80/80",
      "/api/placeholder/80/80",
      "/api/placeholder/80/80"
    ],
    tags: ["Digital", "Contemporáneo", "Emergentes"]
  },
  {
    id: 2,
    title: "Paisajes Surrealistas",
    description: "Mundos fantásticos y paisajes imposibles que desafían la realidad",
    curator: "Carlos Mendoza",
    artworks: 18,
    views: 12300,
    likes: 567,
    followers: 890,
    thumbnail: "/api/placeholder/400/250",
    featured: false,
    color: "from-blue-600 to-cyan-600",
    artworkPreviews: [
      "/api/placeholder/80/80",
      "/api/placeholder/80/80",
      "/api/placeholder/80/80",
      "/api/placeholder/80/80"
    ],
    tags: ["Surrealismo", "Paisajes", "Fantasía"]
  },
  {
    id: 3,
    title: "Retratos del Alma",
    description: "Expresiones humanas capturadas en diferentes técnicas y estilos",
    curator: "Ana Torres",
    artworks: 32,
    views: 22100,
    likes: 1456,
    followers: 2180,
    thumbnail: "/api/placeholder/400/250",
    featured: true,
    color: "from-orange-600 to-red-600",
    artworkPreviews: [
      "/api/placeholder/80/80",
      "/api/placeholder/80/80",
      "/api/placeholder/80/80",
      "/api/placeholder/80/80"
    ],
    tags: ["Retratos", "Expresión", "Humanidad"]
  }
];

export const FeaturedCollections = () => {
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredCollections = mockCollections.filter(collection => {
    if (activeTab === 'featured') return collection.featured;
    return true;
  });

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-dark-secondary dark:via-dark-primary dark:to-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-4">
            <Folder className="h-4 w-4 mr-2" />
            Colecciones Curadas
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            Colecciones
            <span className="text-gradient"> Especialmente Seleccionadas</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Nuestros curadores expertos han seleccionado estas colecciones temáticas para ofrecerte una experiencia artística única
          </p>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-white/50 dark:bg-dark-primary/50 backdrop-blur-sm rounded-full border border-white/20 dark:border-dark-tertiary/50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-dark-primary text-slate-900 dark:text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'featured'
                  ? 'bg-white dark:bg-dark-primary text-slate-900 dark:text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Destacadas
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {filteredCollections.map((collection) => (
            <Card
              key={collection.id}
              className={`group relative overflow-hidden transition-all duration-500 transform hover:scale-105 ${
                hoveredCollection === collection.id ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
              }`}
              onMouseEnter={() => setHoveredCollection(collection.id)}
              onMouseLeave={() => setHoveredCollection(null)}
            >
              {/* Featured Badge */}
              {collection.featured && (
                <div className="absolute top-4 left-4 z-20">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Destacada
                  </Badge>
                </div>
              )}

              {/* Main Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={collection.thumbnail}
                  alt={collection.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    hoveredCollection === collection.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-0 group-hover:opacity-80 transition-opacity duration-500`}></div>

                {/* Floating Action Button */}
                <div className={`absolute top-4 right-4 transition-all duration-500 ${
                  hoveredCollection === collection.id ? 'scale-110 opacity-100' : 'opacity-0'
                }`}>
                  <Button
                    size="sm"
                    className="rounded-full w-10 h-10 p-0 bg-white/90 text-slate-900 hover:bg-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Artwork Previews */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {collection.artworkPreviews.slice(0, 3).map((preview, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-md overflow-hidden border-2 border-white shadow-lg transition-all duration-500 ${
                        hoveredCollection === collection.id
                          ? 'scale-110 opacity-100'
                          : 'opacity-80'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {collection.artworkPreviews.length > 3 && (
                    <div className="w-8 h-8 rounded-md bg-black/50 border-2 border-white shadow-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        +{collection.artworkPreviews.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                {/* Title and Description */}
                <div className="mb-4">
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2 line-clamp-1">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {collection.description}
                  </p>
                </div>

                {/* Curator Info */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-nature-400 to-museum-400 flex items-center justify-center">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Curada por <span className="font-medium text-slate-900 dark:text-white">{collection.curator}</span>
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {collection.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {collection.artworks}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Obras</div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {(collection.views / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Vistas</div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {collection.likes}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Likes</div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {(collection.followers / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Seguidores</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/collection/${collection.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:border-purple-300 group-hover:text-purple-600"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Explorar
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link to="/collections">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
              <Folder className="h-5 w-5 mr-2" />
              Ver Todas las Colecciones
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};