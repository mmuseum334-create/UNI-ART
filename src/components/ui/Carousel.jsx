'use client'

/**
 * Carousel - Interactive carousel component with autoplay, navigation arrows, and dot indicators
 * Supports multiple items per view and customizable autoplay settings
 */
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Carousel = ({
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
  itemsPerView = 1
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = children.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, maxIndex]);

  const goToSlide = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Carousel Container */}
      <div className="relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(totalItems / itemsPerView) * 100}%`
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `${100 / totalItems}%` }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalItems > itemsPerView && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 p-0 bg-white/90 dark:bg-dark-primary/90 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-dark-primary shadow-lg z-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 p-0 bg-white/90 dark:bg-dark-primary/90 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-dark-primary shadow-lg z-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && totalItems > itemsPerView && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-nature-600 dark:bg-nature-400 scale-110'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CarouselItem = ({ children, className = "" }) => {
  return (
    <div className={`px-2 ${className}`}>
      {children}
    </div>
  );
};