import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Badge } from './Badge';
import { ArrowRight, Sparkles, TrendingUp, Star } from 'lucide-react';

export const HeroSection = ({ featuredArtworks = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || featuredArtworks.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredArtworks.length, isHovered]);

  if (!featuredArtworks.length) return null;

  const currentArtwork = featuredArtworks[currentSlide];

  return (
    <section
      className="relative h-[70vh] overflow-hidden bg-gradient-to-br from-nature-900 via-museum-800 to-purple-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentArtwork.imageUrl}
          alt={currentArtwork.title}
          className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out scale-105 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="h-4 w-4 text-white/20" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-nature-600/90 hover:bg-nature-600 text-white border-none">
                <Star className="h-3 w-3 mr-1" />
                Obra Destacada
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10">
                {currentArtwork.category}
              </Badge>
            </div>

            {/* Title with Animation */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              <span className="inline-block animate-fade-in-up">
                {currentArtwork.title.split(' ').map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mr-4"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </h1>

            {/* Artist */}
            <p className="text-xl text-white/90 mb-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              por <span className="font-semibold text-nature-300">{currentArtwork.artist}</span>
            </p>

            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {currentArtwork.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2 text-white/80">
                <TrendingUp className="h-5 w-5 text-nature-400" />
                <span className="font-semibold">{currentArtwork.likes}</span>
                <span>likes</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <span className="font-semibold">{currentArtwork.views}</span>
                <span>visualizaciones</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link to={`/artwork/${currentArtwork.id}`}>
                <Button size="lg" className="bg-nature-600 hover:bg-nature-700 text-white border-none">
                  Ver Obra Completa
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {featuredArtworks.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-3">
            {featuredArtworks.map((_, index) => (
              <button
                key={index}
                className={`w-12 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-110'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Action */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-nature-600 to-museum-600 rounded-full opacity-75 group-hover:opacity-100 animate-pulse"></div>
            <div className="relative bg-white dark:bg-dark-primary rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
              <ArrowRight className="h-6 w-6 text-nature-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};