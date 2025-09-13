import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { featuredArtworks, artCategories } from '../data/mockData';
import {
  ArrowRight,
  TrendingUp,
  Users,
  Heart,
  Eye,
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

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Obras de Arte', value: '2,847', icon: Palette },
    { label: 'Artistas', value: '312', icon: Users },
    { label: 'Visitantes', value: '125k', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-nature-50 via-blue-50 to-purple-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary py-20">
        <div className="absolute inset-0 bg-white/30 dark:bg-dark-primary/30 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient mb-6">
              Bienvenido al Museo Virtual
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Descubre, explora y comparte el arte en todas sus formas. 
              Un espacio donde la creatividad no tiene límites y cada obra cuenta una historia única.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <Button size="lg" className="flex items-center gap-2">
                  Explorar Catálogo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/auth">
                  <Button variant="outline" size="lg">
                    Únete Ahora
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Estadísticas del Museo
            </h2>
            <p className="text-slate-600 dark:text-slate-300">Números que reflejan nuestra comunidad artística</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-nature-100 to-museum-100 dark:from-dark-tertiary dark:to-dark-tertiary">
                        <IconComponent className="h-8 w-8 text-nature-600 dark:text-nature-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Categorías de Arte
            </h2>
            <p className="text-slate-600 dark:text-slate-300">Explora diferentes formas de expresión artística</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artCategories.map((category) => {
              const IconComponent = iconMap[category.icon];
              return (
                <Link key={category.id} to={`/catalog?category=${category.id}`}>
                  <Card className="card-hover cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Obras Destacadas
              </h2>
              <p className="text-slate-600 dark:text-slate-300">Las creaciones más populares de nuestra comunidad</p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">
                Ver Todo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks.map((artwork) => (
              <Link key={artwork.id} to={`/artwork/${artwork.id}`}>
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
                        <p className="text-sm text-slate-600 dark:text-slate-300">por {artwork.artist}</p>
                      </div>
                      <Badge variant="secondary">
                        {artCategories.find(cat => cat.id === artwork.category)?.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {artwork.description}
                    </p>
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
                    <div className="flex flex-wrap gap-1 mt-3">
                      {artwork.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-nature-600 via-museum-500 to-nature-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            ¿Eres un Artista?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a nuestra comunidad y comparte tu arte con el mundo. 
            Es gratuito y fácil de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            ) : (
              <Link to="/upload">
                <Button size="lg" variant="secondary">
                  Subir tu Primera Obra
                </Button>
              </Link>
            )}
            <Link to="/catalog">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-nature-600">
                Explorar Galería
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;