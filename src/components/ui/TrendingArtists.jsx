'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { paintService } from '@/services/paint/paintService'
import { getPublicImageUrl } from '@/lib/supabase'
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const TrendingArtists = () => {
  const router = useRouter()
  const [paintings, setPaintings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState('next')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await paintService.getAll()
        if (res.success) {
          setPaintings(res.data.map(p => ({
            id: p.id,
            title: p.nombre_pintura,
            artist: p.artista,
            userId: p.publicado_por,
            description: p.descripcion_pintura,
            category: p.categoria,
            imageUrl: getPublicImageUrl(p.img_pintura) || `http://localhost:3002${p.img_pintura}`,
            tags: p.etiqueta ? p.etiqueta.split(', ') : [],
          })))
        }
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const go = (dir) => {
    if (animating || paintings.length < 2) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(prev =>
        dir === 'next'
          ? (prev + 1) % paintings.length
          : (prev - 1 + paintings.length) % paintings.length
      )
      setAnimating(false)
    }, 380)
  }

  // Autoplay
  useEffect(() => {
    if (paintings.length < 2) return
    const t = setInterval(() => go('next'), 5000)
    return () => clearInterval(t)
  }, [paintings.length, animating])

  if (isLoading) return (
    <section className="py-24 flex items-center justify-center bg-white dark:bg-[#0f0f0f]">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-t-slate-500 dark:border-t-white/40 rounded-full animate-spin" />
    </section>
  )

  if (paintings.length === 0) return (
    <section className="py-24 flex items-center justify-center bg-white dark:bg-[#0f0f0f]">
      <div className="text-center space-y-2">
        <Sparkles className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto" />
        <p className="text-slate-400 dark:text-white/30 text-sm">No hay obras disponibles</p>
      </div>
    </section>
  )

  // Construir el stack: current + 2 siguientes visibles
  const getCard = (offset) => paintings[(current + offset) % paintings.length]
  const stack = [getCard(2), getCard(1), getCard(0)] // de atrás hacia adelante

  return (
    <section className="py-20 bg-white dark:bg-[#0f0f0f] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2">
              Galería destacada
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-none">
              Obras de Arte
            </h2>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-white/90 tabular-nums">
              {String(current + 1).padStart(2, '0')} / {String(paintings.length).padStart(2, '0')}
            </span>
            <button
              onClick={() => go('prev')}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 dark:border-white/50 text-slate-600 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go('next')}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 dark:border-white/50 text-slate-600 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Layout: stack izquierda + info derecha */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Stack de tarjetas */}
          <div className="relative flex-shrink-0 w-72 sm:w-80 h-[420px] sm:h-[480px]">
            {stack.map((art, i) => {
              const isTop = i === 2
              const isMid = i === 1
              const isBot = i === 0

              // Posición y escala según capa
              const scale    = isTop ? 1    : isMid ? 0.93  : 0.86
              const translateX = isTop ? 0  : isMid ? 20    : 38
              const translateY = isTop ? 0  : isMid ? -12   : -22
              const rotate   = isTop ? 0    : isMid ? 4     : 8
              const zIndex   = isTop ? 30   : isMid ? 20    : 10
              const opacity  = isBot ? 0.5  : isMid ? 0.8   : 1

              // Animación salida
              const exitTranslateX = animating && isTop
                ? (direction === 'next' ? 340 : -340)
                : translateX
              const exitRotate = animating && isTop
                ? (direction === 'next' ? 18 : -18)
                : rotate

              return (
                <div
                  key={`${art.id}-${i}`}
                  className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    transform: `translateX(${exitTranslateX}px) translateY(${translateY}px) scale(${scale}) rotate(${exitRotate}deg)`,
                    zIndex,
                    opacity: animating && isTop ? 0 : opacity,
                    transition: 'transform 380ms cubic-bezier(0.4,0,0.2,1), opacity 380ms ease',
                    boxShadow: isTop
                      ? '0 32px 64px rgba(0,0,0,0.18)'
                      : '0 8px 24px rgba(0,0,0,0.10)',
                  }}
                  onClick={() => isTop && router.push(`/artwork/${art.id}`)}
                >
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x480/1a1a1a/444?text=Sin+Imagen' }}
                  />
                  {/* Overlay inferior solo en la carta del tope */}
                  {isTop && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  )}
                  {isTop && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {art.category}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Info de la carta activa */}
          <div
            className="flex-1 min-w-0 ml-20 px-8 py-8 bg-white/80 dark:bg-[#171717] rounded-lg shadow-lg"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 250ms ease, transform 250ms ease',
            }}
          >
            {(() => {
              const art = paintings[current]
              return (
                <div className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">
                      {art.category}
                    </span>
                    <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mt-2">
                      {art.title}
                    </h3>
                  </div>

                  {/* Artista */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white font-semibold text-sm flex-shrink-0">
                      {art.artist?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest">Artista</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-white">{art.artist}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 dark:bg-white/10" />

                  {/* Descripción */}
                  <p className="text-slate-500 dark:text-white/70 text-sm leading-relaxed line-clamp-4">
                    {art.description}
                  </p>

                  {/* Tags */}
                  {art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {art.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[11px] text-slate-700 dark:text-white/90 border border-slate-600 dark:border-white/80 px-2.5 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => router.push(`/artwork/${art.id}`)}
                      className="group flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-80 active:scale-95 transition-all"
                    >
                      Ver obra
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                    {art.userId && (
                      <button
                        onClick={() => router.push(`/user/${art.userId}`)}
                        className="text-sm font-medium text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 px-5 py-2.5 rounded-full transition-all"
                      >
                        Ver artista
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

        </div>

        {/* Indicadores */}
        <div className="flex items-center justify-center gap-1.5 mt-14">
          {paintings.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (!animating) { setDirection('next'); go('next'); setCurrent(i) } }}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === current ? '2rem' : '0.4rem',
                background: i === current
                  ? 'var(--indicator-active, rgb(15,15,15))'
                  : 'rgba(128,128,128,0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingArtists
