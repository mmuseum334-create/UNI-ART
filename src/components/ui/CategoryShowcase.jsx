'use client'

/**
 * CategoryShowcase - Displays art categories with infinite scroll marquee
 * Features smooth animations and interactive category cards
 */
import Link from 'next/link';
import { Marquee } from './Marquee';
import { Badge } from './Badge';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CategoryShowcase = ({ categories = [], iconMap = {} }) => {
  // Split categories into two rows for marquee effect
  const halfwayPoint = Math.ceil(categories.length / 2);
  const firstRow = categories.slice(0, halfwayPoint);
  const secondRow = categories.slice(halfwayPoint);

  // Category Card Component (estilo simple tipo review)
  const CategoryCard = ({ category }) => {
    const IconComponent = iconMap[category.icon];

    // Si no hay icono, no renderizar el componente
    if (!IconComponent) {
      console.warn(`Icon not found for category: ${category.id}, icon name: ${category.icon}`);
      return null;
    }

    return (
      <Link
        href={`/catalog?category=${category.id}`}
        className="group relative"
      >
        <figure
          className={cn(
            'relative w-80 cursor-pointer overflow-hidden rounded-xl border p-5',
            'min-h-[140px]',
            // light styles
            'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
            // dark styles
            'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
            'transition-all duration-200'
          )}
        >
          {/* Header con icono circular y nombre */}
          <div className="flex flex-row items-center gap-3 mb-4">
            {/* Icono circular con gradiente */}
            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>

            <div className="flex flex-col min-w-0">
              <figcaption className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {category.name}
              </figcaption>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                {Math.floor(Math.random() * 500 + 50)} obras
              </p>
            </div>
          </div>

          {/* Descripción */}
          <blockquote className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {category.description}
          </blockquote>
        </figure>
      </Link>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-dark-secondary dark:via-dark-primary dark:to-dark-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* Header */}
        <div className="text-center">
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
      </div>

      {/* Marquee Categories - Carousel infinito */}
      <div className="relative flex w-full flex-col items-center justify-center gap-4">
        {/* Primera fila: se mueve hacia la izquierda */}
        <Marquee pauseOnHover className="[--duration:25s] [--gap:1.5rem]" repeat={4}>
          {firstRow.map((category, index) => (
            <CategoryCard key={`first-${category.id}-${index}`} category={category} />
          ))}
        </Marquee>

        {/* Segunda fila: se mueve hacia la derecha (reverse) */}
        <Marquee reverse pauseOnHover className="[--duration:25s] [--gap:1.5rem]" repeat={4}>
          {secondRow.map((category, index) => (
            <CategoryCard key={`second-${category.id}-${index}`} category={category} />
          ))}
        </Marquee>

        {/* Gradient Overlays para efecto fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-50 to-transparent dark:from-dark-primary dark:to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-50 to-transparent dark:from-dark-primary dark:to-transparent" />
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
    </section>
  );
};