'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, Box, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { artCategories } from '@/data/mockData';
import SculptureModelViewer from './SculptureModelViewer';

/* ─── Estado badge ─── */
const StatusBadge = ({ status, progress }) => {
  if (status === 'completed') return null;

  if (status === 'processing' || status === 'uploading') {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm p-2">
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="h-3 w-3 animate-spin text-violet-400 flex-shrink-0" />
          <span className="text-[11px] text-white/80 font-medium">
            {status === 'uploading' ? 'Preparando…' : `Generando modelo 3D… ${progress ?? 0}%`}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className="bg-violet-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-red-900/80 backdrop-blur-sm p-2 flex items-center gap-2">
        <AlertTriangle className="h-3 w-3 text-red-300 flex-shrink-0" />
        <span className="text-[11px] text-red-200">Error al generar el modelo 3D</span>
      </div>
    );
  }

  return null;
};

/* ─── Grid Card de escultura ─── */
export const SculptureGridCard = ({ artwork, color, onQuickView }) => {
  const [hovered, setHovered] = useState(false);
  const category = artCategories.find(c => c.id === 'sculptures');
  const hasModel = artwork.status === 'completed' && artwork.modelo_3d_url;
  const firstImage = artwork.imagenes?.[0] || null;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl bg-white dark:bg-[#171717] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/sculpture/${artwork.id}`} className="block">
        {/* Área visual */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 dark:bg-[#0d0d0d]">

          {/* Modelo 3D — se activa al hover si está disponible */}
          {hasModel && hovered ? (
            <SculptureModelViewer
              src={artwork.modelo_3d_url}
              poster={firstImage}
              autoRotate
              cameraControls
              style={{ position: 'absolute', inset: 0 }}
            />
          ) : firstImage ? (
            /* Imagen de referencia cuando no hay hover o no hay modelo */
            <img
              src={firstImage}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300/1a1a1a/444?text=Escultura'; }}
            />
          ) : (
            /* Placeholder sin imagen */
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <Box className="h-12 w-12 text-slate-600" />
            </div>
          )}

          {/* Chip 3D */}
          {hasModel && (
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-violet-600/90 backdrop-blur-sm text-white text-[10px] font-bold">
              <Box className="h-3 w-3" /> 3D
            </div>
          )}

          {/* Chip categoría */}
          <div className="absolute top-2.5 left-2.5 z-20">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white px-2.5 py-1 rounded-full" style={{ background: `${color}cc` }}>
              Escultura
            </span>
          </div>

          {/* Hover hint 3D */}
          {hasModel && !hovered && (
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <span className="text-[10px] bg-black/60 text-white px-2 py-1 rounded-full flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Hover para ver en 3D
              </span>
            </div>
          )}

          {/* Likes / views */}
          <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
              <Heart className="h-3.5 w-3.5 fill-current" /> {artwork.likes}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-sky-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
              <Eye className="h-3.5 w-3.5" /> {artwork.views}
            </span>
          </div>

          {/* Estado procesamiento */}
          <StatusBadge status={artwork.status} progress={artwork.progreso} />
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 mb-0.5">{artwork.title}</h3>
          <p className="text-xs text-slate-500 dark:text-white/60 mb-2">por {artwork.artist}</p>
          <p className="text-xs text-slate-700 dark:text-white/90 line-clamp-2 leading-relaxed mb-3">{artwork.description}</p>
          {artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artwork.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[11px] text-slate-700 dark:text-white/90 border border-slate-200 dark:border-white/80 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
              {artwork.tags.length > 2 && <span className="text-[11px] text-slate-400 dark:text-white/20 px-1">+{artwork.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </Link>

      {/* Quick view */}
      <button
        onClick={e => { e.preventDefault(); onQuickView?.(artwork); }}
        className="absolute top-2.5 right-10 w-8 h-8 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full border transition-all duration-200 text-slate-700 dark:text-white/80 border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:scale-110 shadow-sm z-30"
        aria-label="Vista rápida"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );
};

/* ─── List Card de escultura ─── */
export const SculptureListCard = ({ artwork, color, onQuickView }) => {
  const hasModel = artwork.status === 'completed' && artwork.modelo_3d_url;
  const firstImage = artwork.imagenes?.[0] || null;

  return (
    <div className="group relative flex gap-4 rounded-2xl border transition-all duration-300 overflow-hidden p-3 bg-white dark:bg-[#171717] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-lg">
      <Link href={`/sculpture/${artwork.id}`} className="flex gap-4 flex-1 min-w-0">
        {/* Thumb 3D o imagen */}
        <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900 relative">
          {hasModel ? (
            <SculptureModelViewer
              src={artwork.modelo_3d_url}
              poster={firstImage}
              autoRotate
              cameraControls={false}
              style={{ position: 'absolute', inset: 0 }}
            />
          ) : firstImage ? (
            <img
              src={firstImage}
              alt={artwork.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x200/1a1a1a/444?text=Escultura'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <Box className="h-8 w-8 text-slate-600" />
            </div>
          )}
          {hasModel && (
            <div className="absolute bottom-0 left-0 right-0 bg-violet-600/80 text-center text-[9px] text-white font-bold py-0.5">3D</div>
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0 py-1 pr-10">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{artwork.title}</h3>
            <span className="text-[10px] text-white font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}99` }}>Escultura</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-white/40 mb-1.5">por {artwork.artist}</p>
          <p className="text-xs text-slate-400 dark:text-white/25 line-clamp-2 leading-relaxed mb-2">{artwork.description}</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
              <Heart className="h-3 w-3 fill-current" /> {artwork.likes}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full">
              <Eye className="h-3 w-3" /> {artwork.views}
            </span>
            {artwork.status !== 'completed' && (
              <span className="inline-flex items-center gap-1 text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                <Loader2 className="h-3 w-3 animate-spin" />
                {artwork.status === 'failed' ? 'Error 3D' : `${artwork.progreso ?? 0}%`}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={e => { e.preventDefault(); onQuickView?.(artwork); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 text-slate-700 dark:text-white/80 border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:scale-110 shadow-sm"
        aria-label="Vista rápida"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );
};
