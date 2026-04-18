'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useColor } from '@/contexts/ColorContext';
import { Button } from './Button';
import { bannerService } from '@/services/banner/bannerService';
import { BannerContent, getElStyle } from '@/app/admin/banner/page';
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Pencil, Save, Loader2, Check, X, Plus, Trash2,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTES Y HELPERS
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   MINI UI PANEL
───────────────────────────────────────────── */
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
      const preview = o.val === 'glass'
        ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }
        : o.val === 'context' ? { background: color }
        : { background: 'white' };
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

/* ─────────────────────────────────────────────
   MEDIA BACKGROUND
───────────────────────────────────────────── */
const MediaBackground = ({ item }) => {
  if (!item) return null;
  if (item.type === 'video') {
    return (
      <video key={item.url} autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover">
        <source src={item.url} type="video/mp4" />
      </video>
    );
  }
  return <img key={item.url} src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" />;
};

/* ─────────────────────────────────────────────
   HOME HERO — con edición inline para super_admin
───────────────────────────────────────────── */
const HomeHero = () => {
  const { isAuthenticated, user } = useAuth();
  const { color } = useColor();

  // El rol es un objeto: user.role.name === 'super_admin'
  const isSuperAdmin = user?.role?.name === 'super_admin';

  /* Banner data */
  const DEFAULT_BANNER = {
    media: [{ type: 'video', url: '/sesion1.mp4', order: 0 }],
  };
  const [banner, setBanner] = useState(DEFAULT_BANNER);

  useEffect(() => {
    bannerService.getByPage('home').then(res => {
      if (res.success && res.data) setBanner(res.data);
    });
  }, []);

  /* Slider state */
  const sortedMedia   = [...(banner.media || [])].sort((a, b) => a.order - b.order);
  const [current, setCurrent] = useState(0);
  const intervalRef   = useRef(null);
  const isSlider      = sortedMedia.length > 1;

  /* Editor state */
  const bannerRef     = useRef(null);
  const draggingEl    = useRef(null);
  const resizingEl    = useRef(null);
  const resizeOrigin  = useRef({ clientX: 0, clientY: 0, initFs: 0, initW: 0, initH: 0, axis: 'both' });
  const formRef       = useRef(null);
  const [editMode, setEditMode]   = useState(false);
  const [panelTab, setPanelTab]   = useState('content');
  const [activeEl, setActiveEl]   = useState(null);
  const [snapGuides, setSnapGuides] = useState({ h: false, v: false });
  const [form, setForm]           = useState(formFromSlide(sortedMedia[0]));
  const [isSaving, setIsSaving]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [bannerW, setBannerW]     = useState(1440);

  useEffect(() => { formRef.current = form; }, [form]);
  const sf = (ch) => setForm(p => ({ ...p, ...ch }));

  /* Sync form when banner loads or slide changes */
  useEffect(() => {
    if (banner.media?.length) setForm(formFromSlide(banner.media.sort((a, b) => a.order - b.order)[current]));
  }, [banner, current]);

  /* Measure real banner width for drag scaling */
  useEffect(() => {
    if (!bannerRef.current) return;
    const ro = new ResizeObserver(e => { const w = e[0]?.contentRect.width; if (w) setBannerW(w); });
    ro.observe(bannerRef.current);
    return () => ro.disconnect();
  }, []);

  /* Slider auto-advance (only when not editing) */
  const next = useCallback(() => setCurrent(c => (c + 1) % sortedMedia.length), [sortedMedia.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + sortedMedia.length) % sortedMedia.length), [sortedMedia.length]);

  useEffect(() => {
    if (!isSlider || editMode) return;
    intervalRef.current = setInterval(next, 6000);
    return () => clearInterval(intervalRef.current);
  }, [isSlider, editMode, next]);

  const goTo = (i) => {
    setCurrent(i);
    clearInterval(intervalRef.current);
    if (isSlider && !editMode) intervalRef.current = setInterval(next, 6000);
  };

  /* ── Drag & Resize ── */
  const scale = bannerW / BANNER_REF_W;

  const toReal = (cx, cy) => {
    const rect = bannerRef.current.getBoundingClientRect();
    return {
      x: Math.max(5, Math.min(95, ((cx - rect.left) / bannerW) * 100)),
      y: Math.max(5, Math.min(95, ((cy - rect.top) / (formRef.current.banner_height ?? 600)) * 100)),
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
      const el = resizingEl.current;
      const axis = resizeOrigin.current.axis;
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
    const sv = Math.abs(x - 50) < SNAP_THRESHOLD;
    const sh = Math.abs(y - 50) < SNAP_THRESHOLD;
    if (sv) x = 50; if (sh) y = 50;
    setSnapGuides({ v: sv, h: sh });
    sf({ [`${draggingEl.current}_x`]: x, [`${draggingEl.current}_y`]: y });
  }, [editMode, scale]);

  const onEnd = () => {
    draggingEl.current = null; resizingEl.current = null;
    setActiveEl(null); setSnapGuides({ h: false, v: false });
  };

  /* ── Save ── */
  const handleSave = async () => {
    setIsSaving(true);
    const media = (banner.media || []).map((m, i) => {
      const idx = [...(banner.media || [])].sort((a, b) => a.order - b.order).indexOf(sortedMedia[current]);
      return i === idx ? { ...m, ...form } : m;
    });
    const res = await bannerService.reorderMedia('home', media);
    if (res.success) {
      setBanner(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setIsSaving(false);
  };

  const bannerH = form.banner_height ?? 600;

  /* ── Active slide data (for non-edit view) ── */
  const activeItem  = sortedMedia[current] || sortedMedia[0];

  return (
    <section
      ref={bannerRef}
      className="relative overflow-hidden"
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      style={{ height: bannerH, cursor: editMode ? 'crosshair' : 'default' }}
    >
      {/* ── Media background ── */}
      {isSlider ? (
        sortedMedia.map((item, i) => (
          <div key={item.url}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
            <MediaBackground item={item} />
          </div>
        ))
      ) : (
        <MediaBackground item={activeItem} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${form.overlay_opacity ?? 0.45})` }} />

      {/* Snap guides (edit mode only) */}
      {editMode && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute left-0 right-0" style={{ top: '50%', borderTop: `1px ${snapGuides.h ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.1)'}` }} />
          <div className="absolute top-0 bottom-0" style={{ left: '50%', borderLeft: `1px ${snapGuides.v ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.1)'}` }} />
        </div>
      )}

      {/* ── Banner content (draggable in edit mode) ── */}
      <BannerContent
        form={form}
        color={color}
        draggable={editMode}
        activeEl={activeEl}
        onStart={onStart}
        onResizeStart={onResizeStart}
      />

      {/* ── "Únete Ahora" button (non-edit, non-authenticated) ── */}
      {!editMode && !isAuthenticated && !form.button_text && (
        <div className="absolute z-10"
          style={{ left: '50%', top: '74%', transform: 'translate(-50%, -50%)' }}>
          <Link href="/auth">
            <Button variant="outline" size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-slate-900 shadow-2xl backdrop-blur-sm bg-white/10 transition-all duration-300 transform hover:scale-105">
              Únete Ahora
            </Button>
          </Link>
        </div>
      )}

      {/* ── Slider controls (non-edit) ── */}
      {isSlider && !editMode && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-6 z-10 flex gap-2">
            {sortedMedia.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        </>
      )}

      {/* ── Slide selector (edit mode, multi-slide) ── */}
      {editMode && isSlider && (
        <div className="absolute bottom-4 left-4 z-50 flex gap-2">
          {sortedMedia.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`h-6 rounded-full text-[9px] font-bold px-2.5 transition-all border ${i === current ? 'bg-white text-black border-white' : 'bg-black/50 text-white/60 border-white/20 hover:bg-white/20'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ── Scroll indicator (non-edit) ── */}
      {!editMode && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SUPER ADMIN — botón flotante + panel
      ══════════════════════════════════════════ */}
      {isSuperAdmin && !editMode && (
        <button
          onClick={() => setEditMode(true)}
          className="absolute bottom-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all hover:scale-105 shadow-xl"
          title="Editar banner">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ── Panel lateral de edición ── */}
      {isSuperAdmin && editMode && (
        <div className="absolute top-0 right-0 bottom-0 z-40 w-72 bg-black/85 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <div>
              <p className="text-xs font-semibold text-white/90">Editar Banner · Home</p>
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

            {/* ── CONTENIDO ── */}
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
                    <>
                      <input value={form.badge_text} onChange={e => sf({ badge_text: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/25"
                        placeholder="Texto del badge" />
                      <Row label="Tamaño">
                        <PxInput value={form.badge_fs} onChange={v => sf({ badge_fs: v })} min={10} max={32} />
                      </Row>
                    </>
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

                {/* Cards / Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Cards / Stats</p>
                    <button type="button"
                      onClick={() => sf({ stats: [...(form.stats || []), { value: '', label: '' }] })}
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
                      <button type="button"
                        onClick={() => sf({ stats: form.stats.filter((_, j) => j !== i) })}
                        className="w-6 h-6 flex items-center justify-center rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(form.stats || []).length === 0 && (
                    <p className="text-[9px] text-white/15 italic text-center py-2">Sin cards en este slide</p>
                  )}
                </div>
              </>
            )}

            {/* ── ESTILOS ── */}
            {panelTab === 'style' && (
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
            )}

            {/* ── LAYOUT ── */}
            {panelTab === 'layout' && (
              <div className="space-y-4">
                {/* Altura */}
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
                {(form.stats || []).length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-2">Tamaño de cards</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'stats_card_w',   label: 'Ancho',    min: 60,  max: 400 },
                        { key: 'stats_card_h',   label: 'Alto',     min: 40,  max: 300 },
                        { key: 'stats_gap',      label: 'Gap',      min: 0,   max: 80  },
                        { key: 'stats_value_fs', label: 'Val fs',   min: 12,  max: 80  },
                        { key: 'stats_label_fs', label: 'Lbl fs',   min: 8,   max: 40  },
                      ].map(({ key, label, min, max }) => (
                        <div key={key} className="space-y-1">
                          <p className="text-[9px] text-white/30">{label}</p>
                          <PxInput value={form[key]} onChange={v => sf({ [key]: v })} min={min} max={max} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posiciones X/Y */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold mb-2">Posiciones (%) — o arrastra</p>
                  {[
                    { el: 'badge',    label: 'Badge'     },
                    { el: 'title',    label: 'Título'    },
                    { el: 'subtitle', label: 'Subtítulo' },
                    { el: 'button',   label: 'Botón'     },
                    { el: 'stats',    label: 'Cards'     },
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
            )}

          </div>
        </div>
      )}
    </section>
  );
};

export default HomeHero;