'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArtworkHoverDialog } from '@/components/ui/ArtworkHoverDialog';
import { artCategories } from '@/data/mockData';
import { paintService } from '@/services/paint/paintService';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { getPublicImageUrl } from '@/lib/supabase';
import { useColor } from '@/contexts/ColorContext';
import { useAuth } from '@/contexts/AuthContext';  // ← detecta super_admin
import { bannerService } from '@/services/banner/bannerService';
import { BannerContent, getElStyle } from '@/components/ui/BannerContent';
import { SculptureGridCard, SculptureListCard } from '@/components/sculpture/SculptureCard';
import {
  Search, Grid3X3, List, Heart, Eye,
  SlidersHorizontal, BookOpen, Music, Video,
  Palette, Image, Box, Sparkles, FileText,
  Camera, X, ScanEye, ChevronLeft, ChevronRight,
  Pencil, Save, Loader2, Check, GripVertical,
  AlignLeft, AlignCenter, AlignRight, Plus, Trash2,
  Maximize2, Type, Layout, EyeOff,
} from 'lucide-react';

const iconMap = { BookOpen, Music, Video, Palette, Image, Box, Sparkles, FileText, Camera };

/* ─── constantes ─── */
const BANNER_REF_W   = 1440;
const SNAP_THRESHOLD = 4;
const STYLE_OPTS     = [{ val: 'glass', label: 'Glass' }, { val: 'solid', label: 'Sólido' }, { val: 'context', label: 'Color' }];
const ALIGNS         = [{ val: 'left', Icon: AlignLeft }, { val: 'center', Icon: AlignCenter }, { val: 'right', Icon: AlignRight }];

const EMPTY_FORM = {
  title: '', subtitle: '', button_text: '', button_url: '',
  title_align: 'center', subtitle_align: 'center', button_align: 'center',
  title_x: 50, title_y: 38, subtitle_x: 50, subtitle_y: 57,
  button_x: 50, button_y: 72, stats_x: 50, stats_y: 85,
  stats: [],
  title_fs: 60, subtitle_fs: 18, button_fs: 16,
  stats_value_fs: 28, stats_label_fs: 13,
  stats_card_w: 120, stats_card_h: 80, stats_gap: 16,
  title_lh: 1.1, overlay_opacity: 0.45,
  badge_visible: false, badge_text: '', badge_x: 50, badge_y: 18, badge_fs: 14,
  badge_style: 'glass', button_style: 'context', stats_style: 'glass',
  banner_height: 600,
};

const formFromSlide = (slide) => ({
  ...EMPTY_FORM,
  title:           slide?.title           || '',
  subtitle:        slide?.subtitle        || '',
  button_text:     slide?.button_text     || '',
  button_url:      slide?.button_url      || '',
  title_align:     slide?.title_align     || 'center',
  subtitle_align:  slide?.subtitle_align  || 'center',
  button_align:    slide?.button_align    || 'center',
  title_x:         slide?.title_x         ?? 50,
  title_y:         slide?.title_y         ?? 38,
  subtitle_x:      slide?.subtitle_x      ?? 50,
  subtitle_y:      slide?.subtitle_y      ?? 57,
  button_x:        slide?.button_x        ?? 50,
  button_y:        slide?.button_y        ?? 72,
  stats:           slide?.stats           ?? [],
  stats_x:         slide?.stats_x         ?? 50,
  stats_y:         slide?.stats_y         ?? 85,
  title_fs:        slide?.title_fs        ?? 60,
  subtitle_fs:     slide?.subtitle_fs     ?? 18,
  button_fs:       slide?.button_fs       ?? 16,
  stats_value_fs:  slide?.stats_value_fs  ?? 28,
  stats_label_fs:  slide?.stats_label_fs  ?? 13,
  stats_card_w:    slide?.stats_card_w    ?? 120,
  stats_card_h:    slide?.stats_card_h    ?? 80,
  stats_gap:       slide?.stats_gap       ?? 16,
  title_lh:        slide?.title_lh        ?? 1.1,
  overlay_opacity: slide?.overlay_opacity ?? 0.45,
  badge_visible:   slide?.badge_visible   ?? false,
  badge_text:      slide?.badge_text      || '',
  badge_x:         slide?.badge_x         ?? 50,
  badge_y:         slide?.badge_y         ?? 18,
  badge_fs:        slide?.badge_fs        ?? 14,
  badge_style:     slide?.badge_style     || 'glass',
  button_style:    slide?.button_style    || 'context',
  stats_style:     slide?.stats_style     || 'glass',
  banner_height:   slide?.banner_height   ?? 600,
});

/* ─── mini UI para el panel lateral ─── */
const PxInput = ({ value, onChange, min = 8, max = 200 }) => (
  <div className="flex items-center gap-1">
    <input type="number" min={min} max={max} value={value ?? min}
      onChange={e => onChange(Math.max(min, Math.min(max, +e.target.value)))}
      className="w-14 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-white text-xs text-center outline-none focus:border-violet-400/60 transition-colors" />
    <span className="text-white/25 text-[10px]">px</span>
  </div>
);
const AlignBtns = ({ value, onChange }) => (
  <div className="flex gap-1">
    {ALIGNS.map(({ val, Icon }) => (
      <button key={val} type="button" onClick={() => onChange(val)}
        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${value === val ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/35 hover:bg-white/20'}`}>
        <Icon className="h-3 w-3" />
      </button>
    ))}
  </div>
);
const StylePicker = ({ value, onChange, color }) => (
  <div className="grid grid-cols-3 gap-1">
    {STYLE_OPTS.map(o => {
      const preview = o.val === 'glass' ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }
        : o.val === 'context' ? { background: color } : { background: 'white' };
      return (
        <button key={o.val} type="button" onClick={() => onChange(o.val)}
          className={`py-1.5 rounded-lg text-[9px] font-medium flex flex-col items-center gap-1 border transition-all ${value === o.val ? 'border-violet-400 bg-violet-500/20 text-violet-200' : 'border-white/10 bg-white/5 text-white/30 hover:bg-white/10'}`}>
          <div className="w-4 h-2.5 rounded" style={preview} />
          {o.label}
        </button>
      );
    })}
  </div>
);
const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[9px] text-white/30 uppercase tracking-wider flex-shrink-0">{label}</span>
    {children}
  </div>
);

/* ─── BANNER INLINE EDIT (solo super_admin) ─── */
const InlineBannerEditor = ({ banner, activePage, color, onSaved }) => {
  const bannerRef    = useRef(null);
  const draggingEl   = useRef(null);
  const resizingEl   = useRef(null);
  const resizeOrigin = useRef({ clientX: 0, clientY: 0, initFs: 0, initW: 0, initH: 0, axis: 'both' });
  const formRef      = useRef(null);

  const sortedMedia = [...(banner.media || [])].sort((a, b) => a.order - b.order);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [editMode, setEditMode]   = useState(false);
  const [panelTab, setPanelTab]   = useState('content'); // 'content' | 'style' | 'layout'
  const [activeEl, setActiveEl]   = useState(null);
  const [snapGuides, setSnapGuides] = useState({ h: false, v: false });
  const [form, setForm]           = useState(formFromSlide(sortedMedia[0]));
  const [isSaving, setIsSaving]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [bannerW, setBannerW]     = useState(1440);
  const isSlider = sortedMedia.length > 1;

  useEffect(() => { formRef.current = form; }, [form]);

  // Sincronizar form cuando el banner cambia externamente
  useEffect(() => {
    if (sortedMedia.length > 0) {
      setForm(formFromSlide(sortedMedia[bannerIdx]));
    }
  }, [banner]);

  const sf = (ch) => setForm(p => ({ ...p, ...ch }));

  // Medir ancho real del banner
  useEffect(() => {
    if (!bannerRef.current) return;
    const ro = new ResizeObserver(e => { const w = e[0]?.contentRect.width; if (w) setBannerW(w); });
    ro.observe(bannerRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-advance slider
  const bannerInterval = useRef(null);
  useEffect(() => {
    if (!isSlider || editMode) return;
    bannerInterval.current = setInterval(() => setBannerIdx(c => (c + 1) % sortedMedia.length), 6000);
    return () => clearInterval(bannerInterval.current);
  }, [isSlider, editMode, sortedMedia.length]);

  const activeSlide = sortedMedia[bannerIdx] || sortedMedia[0];

  // Drag/resize en banner real
  const scale = bannerW / BANNER_REF_W;

  const toReal = (cx, cy) => {
    const rect = bannerRef.current.getBoundingClientRect();
    return {
      x: Math.max(5, Math.min(95, ((cx - rect.left) / bannerW) * 100)),
      y: Math.max(5, Math.min(95, ((cy - rect.top) / (form.banner_height ?? 600)) * 100)),
    };
  };

  const onStart = (el) => (e) => {
    if (!editMode) return;
    e.preventDefault(); e.stopPropagation();
    draggingEl.current = el; setActiveEl(el);
  };

  const onResizeStart = (el, axis = 'both') => (e) => {
    if (!editMode) return;
    e.preventDefault(); e.stopPropagation();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    const f = formRef.current;
    resizeOrigin.current = {
      clientX: cx, clientY: cy, axis,
      initFs: f[`${el}_fs`] ?? (el === 'title' ? 60 : el === 'subtitle' ? 18 : el === 'button' ? 16 : 14),
      initW: f.stats_card_w ?? 120, initH: f.stats_card_h ?? 80,
    };
    resizingEl.current = el; setActiveEl(el);
  };

  const onMove = useCallback((e) => {
    if (!editMode) return;
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    if (resizingEl.current) {
      const dy = (cy - resizeOrigin.current.clientY) / scale;
      const dx = (cx - resizeOrigin.current.clientX) / scale;
      const el = resizingEl.current; const axis = resizeOrigin.current.axis;
      if (el === 'stats') {
        const ch = {};
        if (axis === 'w' || axis === 'both') ch.stats_card_w = Math.max(60, Math.round(resizeOrigin.current.initW + dx));
        if (axis === 'h' || axis === 'both') ch.stats_card_h = Math.max(40, Math.round(resizeOrigin.current.initH + dy));
        sf(ch);
      } else {
        const newFs = Math.max(8, Math.min(200, Math.round(resizeOrigin.current.initFs + dy * 0.7)));
        sf({ [`${el}_fs`]: newFs });
      }
      return;
    }
    if (!draggingEl.current) return;
    let { x, y } = toReal(cx, cy);
    const sv = Math.abs(x - 50) < SNAP_THRESHOLD; const sh = Math.abs(y - 50) < SNAP_THRESHOLD;
    if (sv) x = 50; if (sh) y = 50;
    setSnapGuides({ v: sv, h: sh });
    sf({ [`${draggingEl.current}_x`]: x, [`${draggingEl.current}_y`]: y });
  }, [editMode, scale, form.banner_height]);

  const onEnd = () => { draggingEl.current = null; resizingEl.current = null; setActiveEl(null); setSnapGuides({ h: false, v: false }); };

  const handleSave = async () => {
    setIsSaving(true);
    const media = (banner.media || []).map((m, i) => i === bannerIdx ? { ...m, ...form } : m);
    const res = await bannerService.reorderMedia(activePage, media);
    if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); onSaved?.(res.data); }
    setIsSaving(false);
  };

  const bannerH = form.banner_height ?? 600;

  return (
    <div className="relative w-full" style={{ height: bannerH, minHeight: bannerH }}>
      {/* Banner real */}
      <div ref={bannerRef} className="absolute inset-0 overflow-hidden"
        onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchMove={onMove} onTouchEnd={onEnd}
        style={{ cursor: editMode ? 'crosshair' : 'default' }}>

        {/* Media */}
        {isSlider ? (
          sortedMedia.map((item, i) => (
            <div key={`${item.url}-${i}`} className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
              {item.type === 'video'
                ? <video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src={item.url} type="video/mp4" /></video>
                : <img src={item.url} alt="" className="w-full h-full object-cover" />}
            </div>
          ))
        ) : sortedMedia[0]?.type === 'video' ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={sortedMedia[0]?.url} type="video/mp4" />
          </video>
        ) : (
          <img src={sortedMedia[0]?.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}

        <div className="absolute inset-0 z-10" style={{ background: `rgba(0,0,0,${form.overlay_opacity ?? 0.45})` }} />

        {/* Snap guides (solo en edit) */}
        {editMode && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute left-0 right-0" style={{ top: '50%', borderTop: `1px ${snapGuides.h ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.1)'}` }} />
            <div className="absolute top-0 bottom-0" style={{ left: '50%', borderLeft: `1px ${snapGuides.v ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.1)'}` }} />
          </div>
        )}

        {/* Contenido del banner — siempre visible, no solo en edit mode */}
        <div className="absolute inset-0 z-20">
          <BannerContent
            form={form} color={color}
            draggable={editMode} activeEl={activeEl}
            onStart={onStart} onResizeStart={onResizeStart}
          />
        </div>

        {/* Slider controls */}
        {isSlider && !editMode && (
          <>
            <button onClick={() => setBannerIdx(i => (i - 1 + sortedMedia.length) % sortedMedia.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setBannerIdx(i => (i + 1) % sortedMedia.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {sortedMedia.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === bannerIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Botón flotante lápiz (siempre visible para super_admin) ── */}
      {!editMode && (
        <button onClick={() => setEditMode(true)}
          className="absolute bottom-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all hover:scale-105 shadow-xl"
          title="Editar banner">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ── Panel lateral de edición ── */}
      {editMode && (
        <div className="absolute top-0 right-0 bottom-0 z-40 w-72 bg-black/85 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <div>
              <p className="text-xs font-semibold text-white/90">Editar Banner</p>
              <p className="text-[9px] text-white/35 mt-0.5">Arrastra elementos en el banner</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                style={{ background: saved ? '#22c55e' : color }}>
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                {saved ? 'OK' : 'Guardar'}
              </button>
              <button onClick={() => setEditMode(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 flex-shrink-0">
            {[['content', 'Contenido'], ['style', 'Estilos'], ['layout', 'Layout']].map(([tab, label]) => (
              <button key={tab} onClick={() => setPanelTab(tab)}
                className={`flex-1 py-2 text-[10px] font-medium transition-colors ${panelTab === tab ? 'text-white border-b border-violet-400' : 'text-white/35 hover:text-white/55'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-white">

            {panelTab === 'content' && (
              <>
                {/* Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Badge</p>
                    <button type="button" onClick={() => sf({ badge_visible: !form.badge_visible })}
                      className={`text-[9px] px-2 py-1 rounded border transition-colors ${form.badge_visible ? 'border-blue-500/40 bg-blue-500/15 text-blue-300' : 'border-white/10 bg-white/5 text-white/30'}`}>
                      {form.badge_visible ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {form.badge_visible && (
                    <input value={form.badge_text} onChange={e => sf({ badge_text: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/25"
                      placeholder="Texto del badge" />
                  )}
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Título</p>
                  <input value={form.title} onChange={e => sf({ title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/25"
                    placeholder="Título (usa / para 2ª línea en color)" />
                  <Row label="Tamaño · Align">
                    <div className="flex items-center gap-1.5">
                      <PxInput value={form.title_fs} onChange={v => sf({ title_fs: v })} min={16} max={200} />
                      <AlignBtns value={form.title_align} onChange={v => sf({ title_align: v })} />
                    </div>
                  </Row>
                  <Row label="Interlineado">
                    <div className="flex items-center gap-2 flex-1">
                      <input type="range" min={0.7} max={2} step={0.05} value={form.title_lh ?? 1.1}
                        onChange={e => sf({ title_lh: +e.target.value })} className="flex-1 accent-violet-500" />
                      <span className="text-[9px] text-white/40 w-7">{(form.title_lh ?? 1.1).toFixed(2)}</span>
                    </div>
                  </Row>
                </div>

                {/* Subtítulo */}
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Subtítulo</p>
                  <textarea value={form.subtitle} onChange={e => sf({ subtitle: e.target.value })} rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/25 resize-none"
                    placeholder="Descripción (opcional)" />
                  <Row label="Tamaño · Align">
                    <div className="flex items-center gap-1.5">
                      <PxInput value={form.subtitle_fs} onChange={v => sf({ subtitle_fs: v })} min={10} max={60} />
                      <AlignBtns value={form.subtitle_align} onChange={v => sf({ subtitle_align: v })} />
                    </div>
                  </Row>
                </div>

                {/* Botón */}
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Botón</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input value={form.button_text} onChange={e => sf({ button_text: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/25"
                      placeholder="Texto" />
                    <input value={form.button_url} onChange={e => sf({ button_url: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/25"
                      placeholder="URL" />
                  </div>
                  <Row label="Tamaño · Align">
                    <div className="flex items-center gap-1.5">
                      <PxInput value={form.button_fs} onChange={v => sf({ button_fs: v })} min={10} max={40} />
                      <AlignBtns value={form.button_align} onChange={v => sf({ button_align: v })} />
                    </div>
                  </Row>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Cards / Stats</p>
                    <button type="button" onClick={() => sf({ stats: [...(form.stats || []), { value: '', label: '' }] })}
                      className="flex items-center gap-1 text-[9px] border border-white/10 bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                      <Plus className="h-2.5 w-2.5" /> Agregar
                    </button>
                  </div>
                  {(form.stats || []).map((stat, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <input value={stat.value}
                        onChange={e => sf({ stats: form.stats.map((s, j) => j === i ? { ...s, value: e.target.value } : s) })}
                        className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-white/25"
                        placeholder="200+" />
                      <input value={stat.label}
                        onChange={e => sf({ stats: form.stats.map((s, j) => j === i ? { ...s, label: e.target.value } : s) })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-white/25"
                        placeholder="Obras" />
                      <button type="button" onClick={() => sf({ stats: form.stats.filter((_, j) => j !== i) })}
                        className="w-6 h-6 flex items-center justify-center rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {panelTab === 'style' && (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-1.5">Estilo badge</p>
                    <StylePicker value={form.badge_style} onChange={v => sf({ badge_style: v })} color={color} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-1.5">Estilo botón</p>
                    <StylePicker value={form.button_style} onChange={v => sf({ button_style: v })} color={color} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-1.5">Estilo cards</p>
                    <StylePicker value={form.stats_style} onChange={v => sf({ stats_style: v })} color={color} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-1.5">Oscuridad overlay</p>
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={0.9} step={0.05}
                        value={form.overlay_opacity ?? 0.45}
                        onChange={e => sf({ overlay_opacity: +e.target.value })}
                        className="flex-1 accent-violet-500" />
                      <span className="text-[9px] text-white/40 w-8">{Math.round((form.overlay_opacity ?? 0.45) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {panelTab === 'layout' && (
              <>
                <div className="space-y-4">
                  {/* Altura del banner */}
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-2">Altura del banner</p>
                    <div className="flex items-center gap-2">
                      <input type="range" min={300} max={900} step={10}
                        value={form.banner_height ?? 600}
                        onChange={e => sf({ banner_height: +e.target.value })}
                        className="flex-1 accent-violet-500" />
                      <PxInput value={form.banner_height ?? 600} onChange={v => sf({ banner_height: v })} min={300} max={900} />
                    </div>
                  </div>

                  {/* Tamaño cards */}
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-2">Tamaño de cards</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'stats_card_w', label: 'Ancho',    min: 60,  max: 400 },
                        { key: 'stats_card_h', label: 'Alto',     min: 40,  max: 300 },
                        { key: 'stats_gap',    label: 'Gap',      min: 0,   max: 80  },
                        { key: 'stats_value_fs', label: 'Val fs', min: 12,  max: 80  },
                        { key: 'stats_label_fs', label: 'Lbl fs', min: 8,   max: 40  },
                      ].map(({ key, label, min, max }) => (
                        <div key={key} className="space-y-1">
                          <p className="text-[9px] text-white/30">{label}</p>
                          <PxInput value={form[key]} onChange={v => sf({ [key]: v })} min={min} max={max} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Posiciones X/Y manuales */}
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-2">Posiciones (%) — o arrastra</p>
                    {[
                      { el: 'badge',    label: 'Badge'    },
                      { el: 'title',    label: 'Título'   },
                      { el: 'subtitle', label: 'Subtítulo'},
                      { el: 'button',   label: 'Botón'    },
                      { el: 'stats',    label: 'Cards'    },
                    ].map(({ el, label }) => (
                      <div key={el} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] text-white/30 w-16 flex-shrink-0">{label}</span>
                        <input type="number" min={0} max={100} value={Math.round(form[`${el}_x`] ?? 50)}
                          onChange={e => sf({ [`${el}_x`]: +e.target.value })}
                          className="w-12 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-[9px] text-center outline-none focus:border-violet-400/40" />
                        <span className="text-white/20 text-[9px]">x</span>
                        <input type="number" min={0} max={100} value={Math.round(form[`${el}_y`] ?? 50)}
                          onChange={e => sf({ [`${el}_y`]: +e.target.value })}
                          className="w-12 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-[9px] text-center outline-none focus:border-violet-400/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   CATALOG COMPONENT
───────────────────────────────────────────── */
const Catalog = () => {
  const { color } = useColor();
  const { user }  = useAuth();

  // El rol es un objeto: user.role.name === 'super_admin'
  const isSuperAdmin = user?.role?.name === 'super_admin';

  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery]           = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all');
  const [viewMode, setViewMode]                 = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [allPaintings, setAllPaintings]         = useState([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [loadError, setLoadError]               = useState(null);
  const [currentPage, setCurrentPage]           = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [selectedArtwork, setSelectedArtwork]   = useState(null);

  // Banner
  const DEFAULT_BANNER = {
    media: [{ type: 'video', url: '/sesion6.mp4', order: 0, title: '', subtitle: '', button_text: '', button_url: '' }],
  };
  const [banner, setBanner] = useState(DEFAULT_BANNER);

  useEffect(() => {
    bannerService.getByPage('catalog').then(res => {
      if (res.success && res.data) {
        // Asegurar que media existe y tiene la estructura correcta
        const normalized = res.data;
        if (!normalized.media) normalized.media = [];
        // Asegurar que cada media item tiene los campos necesarios
        normalized.media = normalized.media.map(m => ({
          type: m.type || 'image',
          url: m.url || '',
          order: m.order ?? 0,
          title: m.title || '',
          subtitle: m.subtitle || '',
          button_text: m.button_text || '',
          button_url: m.button_url || '',
          title_align: m.title_align || 'center',
          subtitle_align: m.subtitle_align || 'center',
          button_align: m.button_align || 'center',
          title_x: m.title_x ?? 50,
          title_y: m.title_y ?? 38,
          subtitle_x: m.subtitle_x ?? 50,
          subtitle_y: m.subtitle_y ?? 57,
          button_x: m.button_x ?? 50,
          button_y: m.button_y ?? 72,
          stats: m.stats || [],
          stats_x: m.stats_x ?? 50,
          stats_y: m.stats_y ?? 85,
          title_fs: m.title_fs ?? 60,
          subtitle_fs: m.subtitle_fs ?? 18,
          button_fs: m.button_fs ?? 16,
          stats_value_fs: m.stats_value_fs ?? 28,
          stats_label_fs: m.stats_label_fs ?? 13,
          stats_card_w: m.stats_card_w ?? 120,
          stats_card_h: m.stats_card_h ?? 80,
          stats_gap: m.stats_gap ?? 16,
          title_lh: m.title_lh ?? 1.1,
          overlay_opacity: m.overlay_opacity ?? 0.45,
          badge_visible: m.badge_visible ?? false,
          badge_text: m.badge_text || '',
          badge_x: m.badge_x ?? 50,
          badge_y: m.badge_y ?? 18,
          badge_fs: m.badge_fs ?? 14,
          badge_style: m.badge_style || 'glass',
          button_style: m.button_style || 'context',
          stats_style: m.stats_style || 'glass',
          banner_height: m.banner_height ?? 600,
        }));
        setBanner(normalized);
      }
    });
  }, []);

  // Paintings + Sculptures
  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setLoadError(null);
      try {
        // Cargar pinturas y esculturas en paralelo
        const [paintRes, sculptureRes] = await Promise.all([
          paintService.getAll(),
          sculptureService.getAll(),
        ]);

        const paintings = paintRes.success
          ? paintRes.data.map(paint => ({
              id:           `paint-${paint.id}`,
              _rawId:       paint.id,
              type:         'painting',
              title:        paint.nombre_pintura,
              artist:       paint.artista,
              description:  paint.descripcion_pintura,
              category:     paint.categoria,
              imageUrl:     getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`,
              thumbnailUrl: getPublicImageUrl(paint.img_pintura) || `http://localhost:3002${paint.img_pintura}`,
              tags:         paint.etiqueta ? paint.etiqueta.split(', ') : [],
              createdAt:    paint.fecha,
              likes:        paint.likes  || 0,
              views:        paint.views  || 0,
              uploadedBy:   paint.publicado_por,
            }))
          : [];

        const sculptures = sculptureRes.success
          ? sculptureRes.data.map(s => ({
              id:            `sculpture-${s.id}`,
              _rawId:        s.id,
              type:          'sculpture',
              title:         s.nombre_escultura,
              artist:        s.artista,
              description:   s.descripcion_escultura,
              category:      'sculptures',   // siempre mapea al filtro 'sculptures'
              tags:          s.etiqueta ? s.etiqueta.split(', ') : [],
              createdAt:     s.fecha,
              likes:         s.likes    || 0,
              views:         s.views    || 0,
              uploadedBy:    s.publicado_por,
              // Campos específicos de escultura
              imagenes:      s.imagenes || [],
              modelo_3d_url: s.modelo_3d_url || null,
              status:        s.estado_procesamiento === 'completado' ? 'completed'
                           : s.estado_procesamiento === 'procesando' ? 'processing'
                           : s.estado_procesamiento === 'fallido'   ? 'failed'
                           : 'uploading',
              progreso:      s.progreso || 0,
              // Imagen de preview para la card (primera del array)
              imageUrl:      s.imagenes?.[0] || null,
              thumbnailUrl:  s.imagenes?.[0] || null,
            }))
          : [];

        setAllPaintings([...paintings, ...sculptures]);
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
        p.title?.toLowerCase().includes(q) || p.artist?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') results = results.filter(p => p.category === selectedCategory);
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredArtworks(results); setCurrentPage(1);
  }, [searchQuery, selectedCategory, allPaintings]);

  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('all'); };
  const hasActiveFilters = searchQuery || selectedCategory !== 'all';
  const totalPages   = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE);
  const pageArtworks = filteredArtworks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const goToPage = (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Sidebar
  const Sidebar = () => (
    <aside className="w-full lg:w-56 flex-shrink-0 space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 dark:text-white/90 mb-2">Búsqueda</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-white/80 pointer-events-none" />
          <input placeholder="Obras, artistas, tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-white/85 bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 focus:border-slate-300 dark:focus:border-white/20" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 dark:text-white/90 mb-2">Categorías</p>
        <div className="space-y-0.5">
          {[{ id: 'all', name: 'Todas', count: allPaintings.length, icon: null },
            ...artCategories.map(c => ({
              ...c,
              count: c.id === 'sculptures'
                ? allPaintings.filter(p => p.type === 'sculpture').length
                : allPaintings.filter(p => p.category === c.id).length,
            }))
          ].map(cat => {
            const Icon = cat.icon ? iconMap[cat.icon] : null;
            const isActive = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 ${!isActive ? 'text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5' : ''}`}
                style={isActive ? { background: color, color: 'white', fontWeight: 600 } : {}}>
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
        <button onClick={clearFilters}
          className="w-full text-xs flex items-center justify-center gap-1.5 py-2 border border-dashed rounded-lg transition-colors text-slate-400 dark:text-white/30 border-slate-300 dark:border-white/10 hover:text-slate-600 dark:hover:text-white/50">
          <X className="h-3 w-3" /> Limpiar filtros
        </button>
      )}
    </aside>
  );

  const QuickViewBtn = ({ artwork, position = 'card' }) => (
    <button onClick={e => { e.preventDefault(); setSelectedArtwork(artwork); }}
      onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; e.currentTarget.style.borderColor = ''; }}
      className={`flex items-center justify-center rounded-full border transition-all duration-200 text-slate-700 dark:text-white/80 border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:scale-110 shadow-sm ${position === 'card' ? 'absolute top-2.5 right-2.5 w-8 h-8 opacity-0 group-hover:opacity-100' : 'absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8'}`}
      aria-label="Vista rápida"><ScanEye className="h-4 w-4" /></button>
  );

  const GridCard = ({ artwork }) => {
    const category = artCategories.find(c => c.id === artwork.category);
    return (
      <div className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl bg-white dark:bg-[#171717] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10">
        <Link href={`/artwork/${artwork.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-[#222]">
            <img src={artwork.imageUrl || artwork.thumbnailUrl} alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300/1a1a1a/444?text=Sin+Imagen'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {category && (
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white px-2.5 py-1 rounded-full" style={{ background: `${color}cc` }}>{category.name}</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md"><Heart className="h-3.5 w-3.5 fill-current" /> {artwork.likes}</span>
              <span className="inline-flex items-center gap-1.5 bg-sky-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md"><Eye className="h-3.5 w-3.5" /> {artwork.views}</span>
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

  const ListCard = ({ artwork }) => {
    const category = artCategories.find(c => c.id === artwork.category);
    return (
      <div className="group relative flex gap-4 rounded-2xl border transition-all duration-300 overflow-hidden p-3 bg-white dark:bg-[#171717] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-lg">
        <Link href={`/artwork/${artwork.id}`} className="flex gap-4 flex-1 min-w-0">
          <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#222]">
            <img src={artwork.imageUrl || artwork.thumbnailUrl} alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x200/1a1a1a/444?text=Sin+Imagen'; }} />
          </div>
          <div className="flex-1 min-w-0 py-1 pr-10">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{artwork.title}</h3>
              {category && <span className="text-[10px] text-white font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}99` }}>{category.name}</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-white/40 mb-1.5">por {artwork.artist}</p>
            <p className="text-xs text-slate-400 dark:text-white/25 line-clamp-2 leading-relaxed mb-2">{artwork.description}</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full"><Heart className="h-3 w-3 fill-current" /> {artwork.likes}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full"><Eye className="h-3 w-3" /> {artwork.views}</span>
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f]">

      {/* Banner */}
      {isSuperAdmin ? (
        <InlineBannerEditor
          banner={banner}
          activePage="catalog"
          color={color}
          onSaved={(data) => setBanner(data)}
        />
      ) : (
        /* Banner normal para usuarios no-admin */
        <section className="relative overflow-hidden" style={{ minHeight: banner.media?.[0]?.banner_height ?? 600 }}>
          {banner.media && banner.media.length > 0 && (
            banner.media[0].type === 'video' ? (
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src={banner.media[0].url} type="video/mp4" />
              </video>
            ) : (
              <img src={banner.media[0].url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )
          )}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${banner.media?.[0]?.overlay_opacity ?? 0.45})` }} />
          <BannerContent form={formFromSlide(banner.media?.[0])} color={color} draggable={false} />
        </section>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loadError && (
          <div className="mb-6 p-4 rounded-xl border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400">{loadError}</div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block"><Sidebar /></div>
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-600 dark:text-white/80">
                  {isLoading
                    ? <span className="inline-block w-20 h-4 rounded animate-pulse bg-slate-200 dark:bg-white/10" />
                    : <><span className="font-semibold text-slate-800 dark:text-white">{filteredArtworks.length}</span> obras</>}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors text-slate-500 dark:text-white/30 border-slate-200 dark:border-white/10 hover:text-slate-700 dark:hover:text-white/50">
                    <X className="h-3 w-3" /> Limpiar
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors text-slate-600 dark:text-white/40 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                </button>
                <div className="flex items-center rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#171717]">
                  {[{ mode: 'grid', Icon: Grid3X3 }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                    <button key={mode} onClick={() => setViewMode(mode)} className="p-2 transition-colors text-slate-400 dark:text-white/30"
                      style={viewMode === mode ? { background: color, color: 'white' } : {}}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</div>
            ) : filteredArtworks.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-white/10" />
                <h3 className="font-semibold mb-1 text-slate-700 dark:text-white">Sin resultados</h3>
                <p className="text-sm mb-4 text-slate-500 dark:text-white/30">Intenta con otros términos o categorías.</p>
                <button onClick={clearFilters} className="text-sm underline text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/50">Limpiar filtros</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {pageArtworks.map(a =>
                  a.type === 'sculpture'
                    ? <SculptureGridCard key={a.id} artwork={a} color={color} onQuickView={setSelectedArtwork} />
                    : <GridCard key={a.id} artwork={a} />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {pageArtworks.map(a =>
                  a.type === 'sculpture'
                    ? <SculptureListCard key={a.id} artwork={a} color={color} onQuickView={setSelectedArtwork} />
                    : <ListCard key={a.id} artwork={a} />
                )}
              </div>
            )}

            {/* Paginación */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 disabled:cursor-not-allowed">
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => { if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...'); acc.push(p); return acc; }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`e${i}`} className="px-2 text-slate-400 dark:text-white/30">…</span>
                    : <button key={p} onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${currentPage !== p ? 'text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5' : ''}`}
                        style={currentPage === p ? { backgroundColor: color, color: 'white' } : {}}>
                        {p}
                      </button>
                  )
                }
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 disabled:cursor-not-allowed">
                  Siguiente →
                </button>
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