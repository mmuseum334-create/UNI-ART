'use client'

/**
 * Carousel - Interactive carousel component with autoplay, navigation arrows, and indicators
 */
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Carousel = ({
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
  itemsPerView = 1,
  accentColor = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const items = Array.isArray(children) ? children : [children];
  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const goToSlide = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, goToNext]);

  const totalDots = maxIndex + 1;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Track */}
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {items.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && totalItems > itemsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-[42%] -translate-y-1/2 -translate-x-1/2 z-10
              w-9 h-9 rounded-full flex items-center justify-center
              bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700
              text-slate-600 dark:text-slate-300
              hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg
              transition-all duration-200 active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-[42%] -translate-y-1/2 translate-x-1/2 z-10
              w-9 h-9 rounded-full flex items-center justify-center
              bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700
              text-slate-600 dark:text-slate-300
              hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg
              transition-all duration-200 active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Indicators — barras en lugar de puntos */}
      {showDots && totalDots > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-5">
          {Array.from({ length: totalDots }).map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a ${index + 1}`}
                className="h-1 rounded-full transition-all duration-300 bg-slate-300 dark:bg-slate-600"
                style={{
                  width: isActive ? '2rem' : '0.5rem',
                  background: isActive ? (accentColor || '#6366f1') : undefined,
                  opacity: isActive ? 1 : 0.5,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CarouselItem = ({ children, className = "" }) => (
  <div className={`px-2 ${className}`}>
    {children}
  </div>
);
