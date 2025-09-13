import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Carousel, CarouselItem } from './Carousel';
import { Star, TrendingUp, Users, Eye, Heart, Award } from 'lucide-react';

const mockArtists = [
  {
    id: 1,
    name: "Elena Martínez",
    specialty: "Arte Digital",
    avatar: "/api/placeholder/150/150",
    followers: 12500,
    artworks: 48,
    totalLikes: 89000,
    featured: true,
    bio: "Artista digital especializada en retratos futuristas y paisajes surrealistas.",
    recentWorks: [
      "/api/placeholder/100/100",
      "/api/placeholder/100/100",
      "/api/placeholder/100/100"
    ]
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    specialty: "Pintura Abstracta",
    avatar: "/api/placeholder/150/150",
    followers: 8900,
    artworks: 72,
    totalLikes: 67000,
    featured: false,
    bio: "Maestro del color y la forma, explorando emociones a través del arte abstracto.",
    recentWorks: [
      "/api/placeholder/100/100",
      "/api/placeholder/100/100",
      "/api/placeholder/100/100"
    ]
  },
  {
    id: 3,
    name: "Ana Torres",
    specialty: "Fotografía",
    avatar: "/api/placeholder/150/150",
    followers: 15200,
    artworks: 156,
    totalLikes: 134000,
    featured: true,
    bio: "Fotógrafa de naturaleza y retrato con un ojo único para capturar momentos.",
    recentWorks: [
      "/api/placeholder/100/100",
      "/api/placeholder/100/100",
      "/api/placeholder/100/100"
    ]
  },
  {
    id: 4,
    name: "Miguel Santos",
    specialty: "Escultura",
    avatar: "/api/placeholder/150/150",
    followers: 6700,
    artworks: 29,
    totalLikes: 45000,
    featured: false,
    bio: "Escultor contemporáneo que trabaja con materiales reciclados y sostenibles.",
    recentWorks: [
      "/api/placeholder/100/100",
      "/api/placeholder/100/100",
      "/api/placeholder/100/100"
    ]
  },
  {
    id: 5,
    name: "Sofia Ruiz",
    specialty: "Arte Conceptual",
    avatar: "/api/placeholder/150/150",
    followers: 11800,
    artworks: 34,
    totalLikes: 78000,
    featured: true,
    bio: "Artista conceptual que explora temas sociales y ambientales contemporáneos.",
    recentWorks: [
      "/api/placeholder/100/100",
      "/api/placeholder/100/100",
      "/api/placeholder/100/100"
    ]
  }
];

export const TrendingArtists = () => {
  const [hoveredArtist, setHoveredArtist] = useState(null);

  return (
    <section className="py-20 bg-white dark:bg-dark-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-museum-100 text-museum-800 dark:bg-museum-900 dark:text-museum-200 mb-4">
            <Award className="h-4 w-4 mr-2" />
            Artistas del Momento
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            Conoce a Nuestros
            <span className="text-gradient"> Creadores Destacados</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Descubre el talento detrás de las obras más inspiradoras de nuestra comunidad
          </p>
        </div>

        {/* Artists Carousel */}
        <Carousel
          itemsPerView={3}
          autoPlay={true}
          autoPlayInterval={4000}
          className="mb-12"
          showDots={true}
        >
          {mockArtists.map((artist) => (
            <CarouselItem key={artist.id}>
              <Card
                className={`group relative overflow-hidden transition-all duration-500 transform hover:scale-105 ${
                  hoveredArtist === artist.id ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
                onMouseEnter={() => setHoveredArtist(artist.id)}
                onMouseLeave={() => setHoveredArtist(null)}
              >
                {/* Featured Badge */}
                {artist.featured && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                      <Star className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Artist Profile */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      <div className={`w-24 h-24 rounded-full overflow-hidden transition-all duration-500 ${
                        hoveredArtist === artist.id ? 'scale-110 ring-4 ring-nature-300' : ''
                      }`}>
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Online Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-dark-primary animate-pulse"></div>
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">
                      {artist.name}
                    </h3>
                    <p className="text-museum-600 dark:text-museum-400 font-medium mb-3">
                      {artist.specialty}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {artist.bio}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-nature-600 dark:text-nature-400" />
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {artist.followers.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Seguidores</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-museum-600 dark:text-museum-400" />
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {artist.artworks}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Obras</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Heart className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {(artist.totalLikes / 1000).toFixed(1)}k
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Likes</div>
                    </div>
                  </div>

                  {/* Recent Works Preview */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Obras Recientes
                    </div>
                    <div className="flex gap-2">
                      {artist.recentWorks.map((work, index) => (
                        <div
                          key={index}
                          className={`flex-1 aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                            hoveredArtist === artist.id ? 'scale-105' : 'hover:scale-110'
                          }`}
                        >
                          <img
                            src={work}
                            alt={`Obra ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 group-hover:border-nature-300 group-hover:text-nature-600"
                    >
                      Ver Perfil
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-nature-600 hover:bg-nature-700 text-white"
                    >
                      Seguir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </Carousel>

        {/* Call to Action */}
        <div className="text-center">
          <Link to="/artists">
            <Button size="lg" variant="outline" className="group">
              <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver Todos los Artistas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};