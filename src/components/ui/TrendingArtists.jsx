'use client'

/**
 * TrendingArtists - Modern carousel display of artworks
 * Features elegant animations, smooth transitions, and museum-like presentation
 */
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { paintService } from '@/services/paint/paintService'
import { getPublicImageUrl } from '@/lib/supabase'
import {
  ChevronUp,
  ChevronDown,
  Eye,
  User,
  Sparkles
} from 'lucide-react'

const TrendingArtists = () => {
  const router = useRouter()
  const [paintings, setPaintings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState('up')

  useEffect(() => {
    const loadPaintings = async () => {
      setIsLoading(true)
      try {
        const response = await paintService.getAll()
        if (response.success) {
          const transformedPaintings = response.data.map(paint => ({
            id: paint.id,
            title: paint.nombre_pintura,
            artist: paint.artista,
            userId: paint.publicado_por,
            description: paint.descripcion_pintura,
            category: paint.categoria,
            imageUrl: getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`,
            tags: paint.etiqueta ? paint.etiqueta.split(', ') : [],
          }))
          setPaintings(transformedPaintings)
        }
      } catch (error) {
        console.error('Error loading paintings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPaintings()
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (paintings.length === 0) return

    const interval = setInterval(() => {
      goToNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [paintings.length, currentSlide])

  const goToNext = useCallback(() => {
    if (isTransitioning) return
    setDirection('up')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === paintings.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 300)
  }, [isTransitioning, paintings.length])

  const goToPrev = useCallback(() => {
    if (isTransitioning) return
    setDirection('down')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? paintings.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 300)
  }, [isTransitioning, paintings.length])

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === currentSlide) return
    setDirection(index > currentSlide ? 'up' : 'down')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 300)
  }, [isTransitioning, currentSlide])

  const goToArtwork = (artworkId) => {
    router.push(`/artwork/${artworkId}`)
  }

  const goToArtistProfile = (userId) => {
    if (!userId) return
    router.push(`/user/${userId}`)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev])


  if (isLoading) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm tracking-wide uppercase">
            Cargando obras de arte...
          </p>
        </div>
      </section>
    )
  }

  if (paintings.length === 0) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No hay obras disponibles</p>
        </div>
      </section>
    )
  }

  const currentArtwork = paintings[currentSlide]

  return (
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* Main Content */}
      <div className="h-full w-full flex flex-col lg:flex-row">
        {/* Left Panel - Image */}
        <div className="relative h-[45vh] lg:h-full lg:w-1/2 bg-muted/30 flex items-center justify-center p-6 lg:p-12">
          {/* Decorative frame corners */}
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/20" />

          {/* Image Container */}
          <div 
            className={cn(
              "relative max-w-full max-h-full transition-all duration-500 ease-out",
              isTransitioning && direction === 'up' && "opacity-0 translate-y-8",
              isTransitioning && direction === 'down' && "opacity-0 -translate-y-8"
            )}
          >
            {/* Shadow effect */}
            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-primary/10 rounded-sm" />
            
            {/* Main image with frame */}
            <div className="relative bg-card p-3 shadow-2xl">
              <div className="relative overflow-hidden">
                <img
                  src={currentArtwork.imageUrl}
                  alt={currentArtwork.title}
                  className="w-auto h-auto max-h-[35vh] lg:max-h-[70vh] object-contain"
                />
              </div>
              {/* Inner frame border */}
              <div className="absolute inset-3 border border-primary/10 pointer-events-none" />
            </div>
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12">
            <div className="flex items-baseline gap-1 text-muted-foreground">
              <span className="text-3xl lg:text-5xl font-light text-foreground">
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              <span className="text-sm">/</span>
              <span className="text-sm">{String(paintings.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="relative h-[55vh] lg:h-full lg:w-1/2 flex flex-col justify-center pr-12 pl-4 py-8 lg:py-12">
          {/* Navigation Arrows - Desktop */}
          <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              className="rounded-full border-muted-foreground/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="Obra anterior"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full border-muted-foreground/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="Siguiente obra"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress indicators - Desktop */}
          <div className="hidden lg:flex absolute right-12 bottom-12 flex-col items-center gap-2">
            {paintings.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-1.5 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "h-8 bg-primary"
                    : "h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir a obra ${index + 1}`}
              />
            ))}
          </div>

          {/* Content */}
          <div 
            className={cn(
              "space-y-6 transition-all duration-500 ease-out",
              isTransitioning && direction === 'up' && "opacity-0 translate-y-8",
              isTransitioning && direction === 'down' && "opacity-0 -translate-y-8"
            )}
          >
            {/* Category Badge */}
            <Badge 
              variant="outline" 
              className="uppercase tracking-widest text-xs font-normal border-primary/30 text-primary"
            >
              {currentArtwork.category}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground text-balance">
              {currentArtwork.title}
            </h1>

            {/* Artist */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Artista</p>
                <p className="font-medium text-foreground">{currentArtwork.artist}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed max-w-lg text-pretty">
              {currentArtwork.description}
            </p>

            {/* Tags */}
            {currentArtwork.tags && currentArtwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentArtwork.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={() => goToArtwork(currentArtwork.id)}
                className="group"
                size="lg"
              >
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Ver pintura
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => goToArtistProfile(currentArtwork.userId)}
                disabled={!currentArtwork.userId}
                className="group"
              >
                <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Ver artista
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              className="rounded-full"
              aria-label="Obra anterior"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {paintings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-muted-foreground/30"
                  )}
                  aria-label={`Ir a obra ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
              aria-label="Siguiente obra"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>


    </section>
  )
}

export default TrendingArtists
