'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Hash, User } from 'lucide-react';

export const ArtworkHoverDialog = ({ artwork, category, isVisible, onClose, color }) => {
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, onClose]);

  useEffect(() => {
    document.body.style.overflow = isVisible ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isVisible]);

  if (!artwork) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal — layout horizontal como museo */}
      <div
        className={`relative z-10 w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'
        }`}
      >
        {/* Imagen izquierda */}
        <div className="relative hidden sm:block w-2/5 flex-shrink-0">
          <img
            src={artwork.imageUrl || artwork.thumbnailUrl}
            alt={artwork.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        </div>

        {/* Panel derecho */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#171717] min-h-[420px]">
          {/* Header con imagen de fondo en mobile */}
          <div className="relative sm:hidden h-48 overflow-hidden flex-shrink-0">
            <img
              src={artwork.imageUrl || artwork.thumbnailUrl}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#171717] to-transparent" />
          </div>

          {/* Barra superior con categoría y cerrar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
            {category ? (
              <span
                className="text-[11px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full"
                style={{ background: color || '#555' }}
              >
                {category.name}
              </span>
            ) : <span />}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 flex flex-col px-6 pt-4 pb-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mb-4">
              {artwork.title}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: color || '#555' }}
              >
                {artwork.artist?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-500 dark:text-white/40">{artwork.artist}</span>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/10 mb-4" />

            <p className="text-sm text-slate-700 dark:text-white/90 leading-relaxed line-clamp-4 flex-1">
              {artwork.description}
            </p>

            {artwork.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {artwork.tags.slice(0, 6).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-white/90 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full"
                  >
                    <Hash className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={`/artwork/${artwork.id}`}
              onClick={onClose}
              className="group flex items-center justify-between w-full px-5 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] mt-auto"
              style={{ background: color || '#555' }}
            >
              <span>Ver obra completa</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
