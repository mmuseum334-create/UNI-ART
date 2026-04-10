'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArtworkHoverDialog } from '@/components/ui/ArtworkHoverDialog';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import { getPublicImageUrl } from '@/lib/supabase';
import { useColor } from '@/contexts/ColorContext';
import {
  Search, Grid3X3, List, Heart, Eye,
  SlidersHorizontal, BookOpen, Music, Video,
  Palette, Image, Box, Sparkles, FileText,
  Camera, X, ScanEye,
} from 'lucide-react';

const iconMap = { BookOpen, Music, Video, Palette, Image, Box, Sparkles, FileText, Camera };

const Catalog = () => {
  const { color } = useColor();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery]     = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all');
  const [viewMode, setViewMode]           = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredArtworks, setFilteredArtworks]   = useState([]);
  const [allPaintings, setAllPaintings]   = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [loadError, setLoadError]         = useState(null);
  const [selectedArtwork, setSelectedArtwork]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const response = await paintService.getAll();
        if (response.success) {
          setAllPaintings(response.data.map(paint => ({
            id: paint.id,
            title: paint.nombre_pintura,
            artist: paint.artista,
            description: paint.descripcion_pintura,
            category: paint.categoria,
            imageUrl: getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`,
            thumbnailUrl: getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`,
            tags: paint.etiqueta ? paint.etiqueta.split(', ') : [],
            createdAt: paint.fecha,
            likes: paint.likes || 0,
            views: paint.views || 0,
            uploadedBy: paint.publicado_por,
          })));
        } else {
          setLoadError(response.error || 'Error al cargar las pinturas');
        }
      } catch { setLoadError('Error de conexión'); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    let results = [...allPaintings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.artist?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') results = results.filter(p => p.category === selectedCategory);
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredArtworks(results);
  }, [searchQuery, selectedCategory, allPaintings]);

  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('all'); };
  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  // ─── Sidebar ──────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-full lg:w-56 flex-shrink-0 space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/90 mb-2">Búsqueda</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/30 pointer-events-none" />
          <input
            placeholder="Obras, artistas, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border outline-none transition-colors
              text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/25
              bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10
              focus:border-slate-300 dark:focus:border-white/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/90 mb-2">Categorías</p>
        <div className="space-y-0.5">
          {[{ id: 'all', name: 'Todas', count: allPaintings.length, icon: null }, ...artCategories.map(c => ({ ...c, count: allPaintings.filter(p => p.category === c.id).length }))].map(cat => {
            const Icon = cat.icon ? iconMap[cat.icon] : null;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2"
                style={isActive
                  ? { background: color, color: 'white', fontWeight: 600 }
                  : {}}
                {...(!isActive ? { className: 'w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5' } : {})}
              >
                <span className="flex items-center gap-2 dark:text-white">
                  {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                  {cat.name}
                </span>
                <span className="text-xs opacity-50 dark:text-white">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-xs flex items-center justify-center gap-1.5 py-2 border border-dashed rounded-lg transition-colors text-slate-400 dark:text-white/30 border-slate-300 dark:border-white/10 hover:text-slate-600 dark:hover:text-white/50"
        >
          <X className="h-3 w-3" /> Limpiar filtros
        </button>
      )}
    </aside>
  );

  // ─── Quick-view button ────────────────────────────────────
  const QuickViewBtn = ({ artwork, position = 'card' }) => (
    <button
      onClick={e => { e.preventDefault(); setSelectedArtwork(artwork); }}
      onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; e.currentTarget.style.borderColor = ''; }}
      className={`flex items-center justify-center rounded-full border transition-all duration-200
        text-slate-700 dark:text-white/80 border-slate-200 dark:border-white/10
        bg-white dark:bg-[#1a1a1a] hover:scale-110 shadow-sm
        ${position === 'card' ? 'absolute top-2.5 right-2.5 w-8 h-8 opacity-0 group-hover:opacity-100' : 'absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8'}
      `}
      aria-label="Vista rápida"
    >
      <ScanEye className="h-4 w-4" />
    </button>
  );

  // ─── Grid Card ────────────────────────────────────────────
  const GridCard = ({ artwork }) => {
    const category = artCategories.find(c => c.id === artwork.category);
    return (
      <div className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl
        bg-white dark:bg-[#171717] border-slate-200 dark:border-white/5
        hover:border-slate-300 dark:hover:border-white/10">
        <Link href={`/artwork/${artwork.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-[#222]">
            <img
              src={artwork.imageUrl || artwork.thumbnailUrl}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300/1a1a1a/444?text=Sin+Imagen'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {category && (
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white px-2.5 py-1 rounded-full" style={{ background: `${color}cc` }}>
                  {category.name}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                <Heart className="h-3.5 w-3.5 fill-current" /> {artwork.likes}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-sky-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                <Eye className="h-3.5 w-3.5" /> {artwork.views}
              </span>
            </div>
          </div>
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
        <QuickViewBtn artwork={artwork} position="card" />
      </div>
    );
  };

  // ─── List Card ────────────────────────────────────────────
  const ListCard = ({ artwork }) => {
    const category = artCategories.find(c => c.id === artwork.category);
    return (
      <div className="group relative flex gap-4 rounded-2xl border transition-all duration-300 overflow-hidden p-3
        bg-white dark:bg-[#171717] border-slate-200 dark:border-white/5
        hover:border-slate-300 dark:hover:border-white/10 hover:shadow-lg">
        <Link href={`/artwork/${artwork.id}`} className="flex gap-4 flex-1 min-w-0">
          <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#222]">
            <img
              src={artwork.imageUrl || artwork.thumbnailUrl}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x200/1a1a1a/444?text=Sin+Imagen'; }}
            />
          </div>
          <div className="flex-1 min-w-0 py-1 pr-10">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{artwork.title}</h3>
              {category && (
                <span className="text-[10px] text-white font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}99` }}>
                  {category.name}
                </span>
              )}
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
              {artwork.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[11px] text-slate-400 dark:text-white/25 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>
        </Link>
        <QuickViewBtn artwork={artwork} position="list" />
      </div>
    );
  };

  // ─── Skeleton ─────────────────────────────────────────────
  const Skeleton = () => (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 animate-pulse bg-white dark:bg-[#171717]">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-[#222]" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 rounded-full w-3/4 bg-slate-200 dark:bg-[#2a2a2a]" />
        <div className="h-3 rounded-full w-1/2 bg-slate-100 dark:bg-[#222]" />
        <div className="h-3 rounded-full bg-slate-100 dark:bg-[#222]" />
        <div className="h-3 rounded-full w-5/6 bg-slate-100 dark:bg-[#222]" />
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f]">

      {/* Hero — estructura original con video + centrado + stats */}
      <section className="relative py-20 overflow-hidden min-h-[500px] flex items-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/sesion6.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/75" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm px-4 py-1.5 rounded-full mb-6 shadow-2xl">
              <Sparkles className="h-4 w-4" />
              Catálogo Completo
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-2xl">
              Explora Nuestro
              <span className="block drop-shadow-2xl" style={{ color }}>
                Universo Artístico
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
              Descubre {allPaintings.length} obras únicas de artistas talentosos de todo el mundo.
              Filtra, busca y encuentra la inspiración que buscas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { label: 'Obras de Arte', value: allPaintings.length },
                { label: 'Categorías',    value: artCategories.length },
                { label: 'Artistas',      value: 175 },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{s.value}</div>
                  <div className="text-white/90 text-lg">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loadError && (
          <div className="mb-6 p-4 rounded-xl border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400">
            {loadError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block"><Sidebar /></div>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-500 dark:text-white/40">
                  {isLoading
                    ? <span className="inline-block w-20 h-4 rounded animate-pulse bg-slate-200 dark:bg-white/10" />
                    : <><span className="font-semibold text-slate-800 dark:text-white">{filteredArtworks.length}</span> obras</>
                  }
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors text-slate-500 dark:text-white/30 border-slate-200 dark:border-white/10 hover:text-slate-700 dark:hover:text-white/50">
                    <X className="h-3 w-3" /> Limpiar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors text-slate-600 dark:text-white/40 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                </button>

                <div className="flex items-center rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#171717]">
                  {[{ mode: 'grid', Icon: Grid3X3 }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="p-2 transition-colors text-slate-400 dark:text-white/30"
                      style={viewMode === mode ? { background: color, color: 'white' } : {}}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : filteredArtworks.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-white/10" />
                <h3 className="font-semibold mb-1 text-slate-700 dark:text-white">Sin resultados</h3>
                <p className="text-sm mb-4 text-slate-500 dark:text-white/30">Intenta con otros términos o categorías.</p>
                <button onClick={clearFilters} className="text-sm underline text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/50">Limpiar filtros</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredArtworks.map(a => <GridCard key={a.id} artwork={a} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArtworks.map(a => <ListCard key={a.id} artwork={a} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto border-t bg-white dark:bg-[#171717] border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">Filtros</h3>
              <button onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5 text-slate-400 dark:text-white/40" /></button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <ArtworkHoverDialog
        artwork={selectedArtwork}
        category={selectedArtwork ? artCategories.find(c => c.id === selectedArtwork.category) : null}
        isVisible={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        color={color}
      />
    </div>
  );
};

export default Catalog;
