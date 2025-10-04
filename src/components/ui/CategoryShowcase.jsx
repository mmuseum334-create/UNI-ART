'use client'

/**
 * CategoryShowcase - Displays art categories in an interactive grid layout
 * Features hover effects, animations, and category stats
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { ArrowRight, TrendingUp } from 'lucide-react';

export const CategoryShowcase = ({ categories = [], iconMap = {} }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);

  // Inicializar datos solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setCategoryData(categories.map((category) => ({
      ...category,
      particlePositions: [...Array(6)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100
      })),
      artworkCount: Math.floor(Math.random() * 500 + 50)
    })));
  }, [categories]);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-dark-secondary dark:via-dark-primary dark:to-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-nature-100 text-nature-800 dark:bg-nature-900 dark:text-nature-200 mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Explora por Categorías
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            Descubre el Arte en
            <span className="text-gradient"> Todas sus Formas</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Desde pinturas clásicas hasta arte digital moderno, explora nuestra colección organizada por categorías
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryData.length > 0 && categoryData.map((category, index) => {
            const IconComponent = iconMap[category.icon];
            const isHovered = hoveredCategory === category.id;

            return (
              <Link
                key={category.id}
                href={`/catalog?category=${category.id}`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="group"
              >
                <Card className={`relative overflow-hidden transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                  isHovered ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}>
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  {/* Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {category.particlePositions.map((pos, i) => (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 bg-white/30 rounded-full transition-all duration-1000 ${
                          isHovered ? 'animate-float' : 'opacity-0'
                        }`}
                        style={{
                          left: `${pos.left}%`,
                          top: `${pos.top}%`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      ></div>
                    ))}
                  </div>

                  <CardContent className="relative z-10 p-8 h-full flex flex-col">
                    {/* Icon Container */}
                    <div className={`relative mb-6 transition-all duration-500 ${isHovered ? 'scale-110' : ''}`}>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center transition-all duration-500 ${
                        isHovered ? 'rotate-12 shadow-lg' : ''
                      }`}>
                        <IconComponent className={`h-8 w-8 text-white transition-all duration-500 ${
                          isHovered ? 'scale-110' : ''
                        }`} />
                      </div>

                      {/* Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 blur-xl transition-opacity duration-500 ${
                        isHovered ? 'opacity-50' : ''
                      }`}></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-display font-bold text-xl mb-3 transition-colors duration-300 ${
                        isHovered ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {category.name}
                      </h3>

                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isHovered ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {category.description}
                      </p>
                    </div>

                    {/* Action Indicator */}
                    <div className="flex items-center justify-between mt-6">
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        isHovered ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        Explorar
                      </div>

                      <ArrowRight className={`h-5 w-5 transition-all duration-300 ${
                        isHovered ? 'text-white translate-x-1' : 'text-slate-400'
                      }`} />
                    </div>

                    {/* Stats Badge */}
                    <div className={`absolute top-4 right-4 transition-all duration-300 ${
                      isHovered ? 'scale-110' : ''
                    }`}>
                      <Badge variant="secondary" className="bg-white/90 dark:bg-dark-primary/90 backdrop-blur-sm">
                        {category.artworkCount} obras
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link href="/catalog">
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-nature-600 to-museum-600 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Ver Todas las Categorías
              <ArrowRight className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};