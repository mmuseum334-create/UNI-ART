'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { bannerService } from '@/services/banner/bannerService';
import { useColor } from '@/contexts/ColorContext';
import {
  Save, Upload, Trash2, Image as ImageIcon, Video,
  Plus, Loader2, Check, ChevronLeft, ChevronRight,
  AlignLeft, AlignCenter, AlignRight, GripVertical,
  Sparkles, Type, Layout, Eye, EyeOff, Maximize2,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────── */
const PAGES = [
  { id: 'home',    label: 'Inicio',   ratio: '16/6' },
  { id: 'catalog', label: 'Catálogo', ratio: '16/5' },
];
const ALIGNS         = [{ val: 'left', Icon: AlignLeft }, { val: 'center', Icon: AlignCenter }, { val: 'right', Icon: AlignRight }];
const SNAP_THRESHOLD = 4;
const BANNER_REF_W   = 1440;

const STYLE_OPTS = [
  { val: 'glass',   label: 'Glass'  },
  { val: 'solid',   label: 'Sólido' },
  { val: 'context', label: 'Color'  },
];

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
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
export const getElStyle = (styleVal, ctxColor) => {
  if (styleVal === 'glass')   return { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' };
  if (styleVal === 'context') return { background: ctxColor, border: `1px solid ${ctxColor}`, color: 'white' };
  return { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.5)', color: '#111' };
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
});

/* ─────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────── */
const AlignBtns = ({ value, onChange }) => (
  <div className="flex gap-1">
    {ALIGNS.map(({ val, Icon }) => (
      <button key={val} type="button" onClick={() => onChange(val)}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${value === val ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
        <Icon className="h-3.5 w-3.5" />
      </button>
    ))}
  </div>
);

const PxInput = ({ value, onChange, min = 8, max = 200 }) => (
  <div className="flex items-center gap-1">
    <input type="number" min={min} max={max} value={value ?? min}
      onChange={e => onChange(Math.max(min, Math.min(max, +e.target.value)))}
      className="w-14 bg-[#0d0d0d] border border-white/10 rounded-lg px-2 py-1 text-white text-xs text-center outline-none focus:border-violet-500/60 transition-colors" />
    <span className="text-white/25 text-[10px]">px</span>
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${value ? 'bg-blue-500/15 text-blue-300 border-blue-500/25' : 'bg-white/5 text-white/30 border-white/8 hover:bg-white/8'}`}>
    {value ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
    {label}
  </button>
);

const StylePicker = ({ value, onChange, color }) => (
  <div className="grid grid-cols-3 gap-1.5">
    {STYLE_OPTS.map(o => {
      const preview = o.val === 'glass'
        ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }
        : o.val === 'context' ? { background: color }
        : { background: 'white' };
      return (
        <button key={o.val} type="button" onClick={() => onChange(o.val)}
          className={`py-2 rounded-lg text-[10px] font-medium transition-all border flex flex-col items-center gap-1 ${value === o.val ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-white/8 bg-white/3 text-white/35 hover:bg-white/8'}`}>
          <div className="w-5 h-3 rounded" style={preview} />
          {o.label}
        </button>
      );
    })}
  </div>
);

const Section = ({ icon: Icon, title, badge, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left">
        <Icon className="h-3.5 w-3.5 text-white/35 flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50 flex-1">{title}</span>
        {badge && <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full border border-violet-500/20">{badge}</span>}
        <ChevronRight className={`h-3.5 w-3.5 text-white/15 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/[0.04]">{children}</div>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   RESIZE HANDLES
───────────────────────────────────────────── */
const RH_W = ({ onResizeStart }) => (
  <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-3.5 h-7 rounded bg-blue-500 z-20 flex items-center justify-center cursor-e-resize hover:bg-blue-400 transition-colors"
    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e, 'w'); }}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e, 'w'); }}>
    <svg width="4" height="8" viewBox="0 0 4 8" fill="none"><path d="M2 1V7M1 2.5L0 4L1 5.5M3 2.5L4 4L3 5.5" stroke="white" strokeWidth="0.8" strokeLinecap="round"/></svg>
  </div>
);
const RH_H = ({ onResizeStart }) => (
  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-3.5 w-7 rounded bg-green-500 z-20 flex items-center justify-center cursor-s-resize hover:bg-green-400 transition-colors"
    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e, 'h'); }}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e, 'h'); }}>
    <svg width="8" height="4" viewBox="0 0 8 4" fill="none"><path d="M1 2H7M2.5 1L4 0L5.5 1M2.5 3L4 4L5.5 3" stroke="white" strokeWidth="0.8" strokeLinecap="round"/></svg>
  </div>
);
const RH_D = ({ onResizeStart }) => (
  <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded bg-violet-500 z-20 flex items-center justify-center cursor-se-resize hover:bg-violet-400 transition-colors"
    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e); }}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e); }}>
    <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 5L5 1M3 5L5 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
  </div>
);

/* ─────────────────────────────────────────────
   DRAGGABLE ELEMENT
───────────────────────────────────────────── */
const DraggableEl = ({ x, y, onStart, onResizeStart, onResizeStartW, onResizeStartH, children, active }) => (
  <div className="absolute z-10 group"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', cursor: 'grab' }}
    onMouseDown={onStart} onTouchStart={onStart}>
    <div className={`relative border border-dashed rounded-lg transition-colors ${active ? 'border-blue-400 bg-blue-500/5' : 'border-white/25 group-hover:border-white/55'}`}>
      {children}
      {onResizeStart  && <RH_D onResizeStart={onResizeStart} />}
      {onResizeStartW && <RH_W onResizeStart={onResizeStartW} />}
      {onResizeStartH && <RH_H onResizeStart={onResizeStartH} />}
    </div>
    <div className={`absolute -top-2.5 -left-2.5 rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-20 transition-colors ${active ? 'bg-blue-500' : 'bg-white/25 group-hover:bg-blue-500'}`}>
      <GripVertical className="h-3 w-3 text-white" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   BANNER CONTENT — shared between preview & real banner
───────────────────────────────────────────── */
export const BannerContent = ({ form, color, draggable = false, activeEl = null, onStart, onResizeStart }) => {
  const badgeStyle  = getElStyle(form.badge_style  || 'glass',   color);
  const btnStyle    = getElStyle(form.button_style  || 'context', color);
  const statsStyle  = getElStyle(form.stats_style   || 'glass',   color);

  const Wrap = ({ el, x, y, children, rD, rW, rH }) => {
    if (!draggable) return (
      <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>{children}</div>
    );
    return (
      <DraggableEl x={x} y={y} active={activeEl === el}
        onStart={onStart?.(el)}
        onResizeStart={rD ? onResizeStart?.(el)        : undefined}
        onResizeStartW={rW ? onResizeStart?.(el, 'w')  : undefined}
        onResizeStartH={rH ? onResizeStart?.(el, 'h')  : undefined}>
        {children}
      </DraggableEl>
    );
  };

  return (
    <>
      {/* Badge */}
      {form.badge_visible && form.badge_text && (
        <Wrap el="badge" x={form.badge_x ?? 50} y={form.badge_y ?? 18} rD>
          <div className="inline-flex items-center gap-2 rounded-full whitespace-nowrap"
            style={{ ...badgeStyle, fontSize: form.badge_fs ?? 14, padding: `${Math.round((form.badge_fs ?? 14) * 0.4)}px ${Math.round((form.badge_fs ?? 14) * 1.1)}px` }}>
            <Sparkles style={{ width: (form.badge_fs ?? 14) * 0.85, height: (form.badge_fs ?? 14) * 0.85, flexShrink: 0 }} />
            {form.badge_text}
          </div>
        </Wrap>
      )}

      {/* Título */}
      {form.title && (
        <Wrap el="title" x={form.title_x ?? 50} y={form.title_y ?? 38} rD>
          <div className="font-bold text-white drop-shadow-2xl whitespace-nowrap"
            style={{ fontSize: form.title_fs ?? 60, textAlign: form.title_align || 'center', lineHeight: form.title_lh ?? 1.1 }}>
            {form.title.includes('/') ? (
              <>
                <span>{form.title.split('/')[0]}</span>
                <span className="block whitespace-nowrap" style={{ color }}>{form.title.split('/')[1]}</span>
              </>
            ) : form.title}
          </div>
        </Wrap>
      )}

      {/* Subtítulo */}
      {form.subtitle && (
        <Wrap el="subtitle" x={form.subtitle_x ?? 50} y={form.subtitle_y ?? 57} rD>
          <div className="text-white/85 leading-relaxed"
            style={{ fontSize: form.subtitle_fs ?? 18, textAlign: form.subtitle_align || 'center',}}>
            {form.subtitle}
          </div>
        </Wrap>
      )}

      {/* Botón */}
      {form.button_text && (
        <Wrap el="button" x={form.button_x ?? 50} y={form.button_y ?? 72} rD>
          <div style={{ textAlign: form.button_align || 'center' }}>
            <span className="inline-block font-semibold rounded-xl whitespace-nowrap"
              style={{ ...btnStyle, fontSize: form.button_fs ?? 16, padding: `${Math.round((form.button_fs ?? 16) * 0.55)}px ${Math.round((form.button_fs ?? 16) * 1.4)}px` }}>
              {form.button_text}
            </span>
          </div>
        </Wrap>
      )}

      {/* Stats / Cards */}
      {form.stats?.length > 0 && (
        <Wrap el="stats" x={form.stats_x ?? 50} y={form.stats_y ?? 85} rD rW rH>
          <div className="flex flex-nowrap" style={{ gap: form.stats_gap ?? 16 }}>
            {form.stats.map((s, i) => (
              <div key={i} className="rounded-xl text-center flex flex-col items-center justify-center flex-shrink-0"
                style={{ ...statsStyle, minWidth: form.stats_card_w ?? 120, minHeight: form.stats_card_h ?? 80, padding: `${Math.round((form.stats_card_h ?? 80) * 0.15)}px ${Math.round((form.stats_card_w ?? 120) * 0.18)}px` }}>
                <div className="font-bold leading-none" style={{ fontSize: form.stats_value_fs ?? 28 }}>{s.value || '—'}</div>
                <div className="opacity-65 leading-tight mt-1" style={{ fontSize: form.stats_label_fs ?? 13 }}>{s.label || '...'}</div>
              </div>
            ))}
          </div>
        </Wrap>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   SLIDE PREVIEW
───────────────────────────────────────────── */
const SlidePreview = ({ slide, form, onPositionChange, onSizeChange, pageRatio }) => {
  const { color }    = useColor();
  const wrapperRef   = useRef(null);
  const draggingEl   = useRef(null);
  const resizingEl   = useRef(null);
  const resizeOrigin = useRef({ clientX: 0, clientY: 0, initFs: 0, initW: 0, initH: 0, axis: 'both' });
  const formRef      = useRef(form);
  const [activeEl, setActiveEl]     = useState(null);
  const [snapGuides, setSnapGuides] = useState({ h: false, v: false });
  const [resizeInfo, setResizeInfo] = useState(null);
  const [wrapW, setWrapW]           = useState(700);

  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(e => { const w = e[0]?.contentRect.width; if (w) setWrapW(w); });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const [rW, rH] = (() => {
    const [a, b] = (pageRatio || '16/6').split('/').map(Number);
    return [BANNER_REF_W, BANNER_REF_W * b / a];
  })();
  const scale   = wrapW / rW;
  const scaledH = rH * scale;

  const toReal = (cx, cy) => {
    const rect = wrapperRef.current.getBoundingClientRect();
    return {
      x: Math.max(5, Math.min(95, ((cx - rect.left) / wrapW) * 100)),
      y: Math.max(5, Math.min(95, ((cy - rect.top) / scaledH) * 100)),
    };
  };

  const onStart = (el) => (e) => { e.preventDefault(); e.stopPropagation(); draggingEl.current = el; setActiveEl(el); setResizeInfo(null); };

  const onResizeStart = (el, axis = 'both') => (e) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    const f = formRef.current;
    resizeOrigin.current = {
      clientX: cx, clientY: cy, axis,
      initFs: f[`${el}_fs`] ?? (el === 'title' ? 60 : el === 'subtitle' ? 18 : el === 'button' ? 16 : el === 'badge' ? 14 : 28),
      initW: f.stats_card_w ?? 120,
      initH: f.stats_card_h ?? 80,
    };
    resizingEl.current = el; setActiveEl(el);
  };

  const onMove = useCallback((e) => {
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    if (resizingEl.current) {
      const dy = (cy - resizeOrigin.current.clientY) / scale;
      const dx = (cx - resizeOrigin.current.clientX) / scale;
      const el = resizingEl.current; const axis = resizeOrigin.current.axis;
      if (el === 'stats') {
        const ch = {};
        if (axis === 'w' || axis === 'both') ch.stats_card_w = Math.max(60,  Math.round(resizeOrigin.current.initW + dx));
        if (axis === 'h' || axis === 'both') ch.stats_card_h = Math.max(40,  Math.round(resizeOrigin.current.initH + dy));
        onSizeChange(ch);
        setResizeInfo({ el, w: ch.stats_card_w ?? resizeOrigin.current.initW, h: ch.stats_card_h ?? resizeOrigin.current.initH });
      } else {
        const newFs = Math.max(8, Math.min(200, Math.round(resizeOrigin.current.initFs + dy * 0.7)));
        onSizeChange({ [`${el}_fs`]: newFs });
        setResizeInfo({ el, fs: newFs });
      }
      return;
    }
    if (!draggingEl.current) return;
    let { x, y } = toReal(cx, cy);
    const sv = Math.abs(x - 50) < SNAP_THRESHOLD;
    const sh = Math.abs(y - 50) < SNAP_THRESHOLD;
    if (sv) x = 50; if (sh) y = 50;
    setSnapGuides({ v: sv, h: sh });
    onPositionChange(draggingEl.current, x, y);
  }, [onPositionChange, onSizeChange, scale, scaledH, wrapW]);

  const onEnd = () => { draggingEl.current = null; resizingEl.current = null; setActiveEl(null); setSnapGuides({ h: false, v: false }); setResizeInfo(null); };

  return (
    <div ref={wrapperRef} className="relative w-full select-none" style={{ height: scaledH }}
      onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd} onTouchMove={onMove} onTouchEnd={onEnd}>
      <div className="absolute top-0 left-0 overflow-hidden"
        style={{ width: rW, height: rH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {/* Media */}
        {slide.type === 'video'
          ? <video src={slide.url} className="absolute inset-0 w-full h-full object-cover" muted />
          : <img src={slide.url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${form.overlay_opacity ?? 0.45})` }} />

        {/* Snap guides */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-0" style={{ top: '50%', borderTop: `2px ${snapGuides.h ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.12)'}` }} />
          <div className="absolute top-0 bottom-0" style={{ left: '50%', borderLeft: `2px ${snapGuides.v ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.12)'}` }} />
          {resizeInfo && (
            <div className="absolute bottom-8 right-8 text-2xl font-mono bg-black/80 text-white px-5 py-2 rounded-xl pointer-events-none">
              {resizeInfo.fs !== undefined ? `${resizeInfo.fs}px` : `${resizeInfo.w} × ${resizeInfo.h}px`}
            </div>
          )}
        </div>

        <BannerContent form={form} color={color} draggable activeEl={activeEl} onStart={onStart} onResizeStart={onResizeStart} />

        {!form.title && !form.subtitle && !form.button_text && !form.stats?.length && !form.badge_visible && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/15 font-light tracking-widest" style={{ fontSize: 28 }}>Agrega contenido al slide</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   THUMBNAIL
───────────────────────────────────────────── */
const MediaThumb = ({ item, index, total, selected, onSelect, onRemove, onMoveLeft, onMoveRight }) => (
  <div onClick={() => onSelect(index)}
    className={`relative group rounded-xl overflow-hidden border cursor-pointer transition-all flex-shrink-0 bg-[#151515] ${selected ? 'border-violet-500 ring-2 ring-violet-500/25' : 'border-white/8 hover:border-white/25'}`}
    style={{ aspectRatio: '16/9', minWidth: 180 }}>
    {item.type === 'video'
      ? <video src={item.url} className="w-full h-full object-cover" muted />
      : <img src={item.url} alt="" className="w-full h-full object-cover" />}
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
      <div className="flex justify-end">
        <button onClick={e => { e.stopPropagation(); onRemove(index); }}
          className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
          <Trash2 className="h-3.5 w-3.5 text-white" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 items-center">
          {item.type === 'video' ? <Video className="h-4 w-4 text-white/70" /> : <ImageIcon className="h-4 w-4 text-white/70" />}
          <span className="text-xs text-white/70">{item.type === 'video' ? 'Video' : 'Imagen'}</span>
        </div>
        <div className="flex gap-1">
          {[[-1, onMoveLeft, index === 0], [1, onMoveRight, index === total - 1]].map(([dir, fn, dis]) => (
            <button key={dir} onClick={e => { e.stopPropagation(); fn(index); }} disabled={dis}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center disabled:opacity-30">
              {dir === -1 ? <ChevronLeft className="h-3.5 w-3.5 text-white" /> : <ChevronRight className="h-3.5 w-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center font-bold">{index + 1}</div>
    {item.title && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-2 pb-1.5 pt-3">
        <p className="text-[10px] text-white/80 truncate">{item.title}</p>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────── */
export default function AdminBannerPage() {
  const { color } = useColor();
  const [activePage, setActivePage]     = useState('home');
  const [config, setConfig]             = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isUploading, setIsUploading]   = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [saved, setSaved]               = useState(false);
  const [error, setError]               = useState(null);
  const [selectedIdx, setSelectedIdx]   = useState(0);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const fileRef = useRef(null);

  const sf = (changes) => setForm(p => ({ ...p, ...changes }));

  const load = async (page) => {
    setIsLoading(true); setConfig(null); setError(null);
    const res = await bannerService.getByPage(page);
    if (res.success) { setConfig(res.data); setSelectedIdx(0); setForm(formFromSlide(res.data.media?.[0])); }
    else setError(res.error);
    setIsLoading(false);
  };
  useEffect(() => { load(activePage); }, [activePage]);

  const sortedMedia  = config?.media ? [...config.media].sort((a, b) => a.order - b.order) : [];
  const currentSlide = sortedMedia[selectedIdx];
  const activeCfg    = PAGES.find(p => p.id === activePage);

  const handleSelectSlide = (idx) => { setSelectedIdx(idx); setSaved(false); setForm(formFromSlide(sortedMedia[idx])); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    const res = await bannerService.uploadMedia(activePage, file);
    if (res.success) { setConfig(res.data); const ni = (res.data.media?.length ?? 1) - 1; setSelectedIdx(ni); setForm(formFromSlide(res.data.media?.[ni])); }
    else setError(res.error);
    setIsUploading(false); e.target.value = '';
  };

  const handleRemove = async (index) => {
    const res = await bannerService.removeMedia(activePage, index);
    if (res.success) { setConfig(res.data); const ni = Math.max(0, index - 1); setSelectedIdx(ni); setForm(formFromSlide(res.data.media?.[ni])); }
    else setError(res.error);
  };

  const move = async (index, dir) => {
    const media = [...config.media]; const ni = index + dir;
    [media[index], media[ni]] = [media[ni], media[index]];
    const reordered = media.map((m, i) => ({ ...m, order: i }));
    setConfig(p => ({ ...p, media: reordered })); setSelectedIdx(ni);
    await bannerService.reorderMedia(activePage, reordered);
  };

  const handleSave = async () => {
    if (!config || sortedMedia.length === 0) return;
    setIsSaving(true);
    const media = config.media.map((m, i) => i === selectedIdx ? { ...m, ...form } : m);
    const res = await bannerService.reorderMedia(activePage, media);
    if (res.success) { setConfig(res.data); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else setError(res.error);
    setIsSaving(false);
  };

  const handlePositionChange = useCallback((el, x, y) => sf({ [`${el}_x`]: x, [`${el}_y`]: y }), []);
  const handleSizeChange     = useCallback((ch) => setForm(p => ({ ...p, ...ch })), []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Configurar Banner</h1>
            <p className="text-white/35 text-xs mt-0.5">
              Arrastra · <span className="text-blue-400">azul</span> ancho · <span className="text-green-400">verde</span> alto · <span className="text-violet-400">violeta</span> ambos
            </p>
          </div>
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/8">
            {PAGES.map(p => (
              <button key={p.id} onClick={() => { if (p.id !== activePage) { setActivePage(p.id); setSaved(false); } }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activePage === p.id ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="h-7 w-7 animate-spin text-white/15" /></div>
        ) : !config ? (
          <div className="text-red-400 text-sm bg-red-950/25 border border-red-900/35 rounded-xl px-4 py-3">{error || 'No se pudo cargar'}</div>
        ) : (
          <div className="space-y-4">

            {/* ── Slides ── */}
            <div className="bg-[#111] rounded-2xl border border-white/[0.05] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white/85 text-sm">Media</h2>
                  <p className="text-[11px] text-white/25 mt-0.5">{sortedMedia.length > 1 ? `${sortedMedia.length} slides` : 'Imágenes o videos del banner'}</p>
                </div>
                <button onClick={() => fileRef.current?.click()} disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-40">
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  {isUploading ? 'Subiendo...' : 'Agregar'}
                </button>
                <input ref={fileRef} type="file" accept="video/*,image/*" className="hidden" onChange={handleUpload} />
              </div>

              {sortedMedia.length === 0 ? (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/[0.07] rounded-xl p-10 flex flex-col items-center gap-3 text-white/15 hover:border-white/15 hover:text-white/30 transition-colors">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Sube el primer video o imagen</span>
                </button>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {sortedMedia.map((item, i) => (
                    <div key={`${item.url}-${i}`} style={{ minWidth: 190, maxWidth: 210 }}>
                      <MediaThumb item={item} index={i} total={sortedMedia.length}
                        selected={selectedIdx === i} onSelect={handleSelectSlide}
                        onRemove={handleRemove} onMoveLeft={idx => move(idx, -1)} onMoveRight={idx => move(idx, 1)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Editor ── */}
            {sortedMedia.length > 0 && currentSlide && (
              <div className="bg-[#111] rounded-2xl border border-white/[0.05] p-5 space-y-4">

                {/* Editor header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white/85 text-sm">
                      {sortedMedia.length > 1 ? `Slide ${selectedIdx + 1} / ${sortedMedia.length}` : 'Contenido del Banner'}
                    </h2>
                    <p className="text-[11px] text-white/25 mt-0.5">Arrastra los elementos directamente en el preview</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sortedMedia.length > 1 && (
                      <div className="flex gap-1">
                        {[[-1, selectedIdx === 0], [1, selectedIdx === sortedMedia.length - 1]].map(([dir, dis]) => (
                          <button key={dir} onClick={() => handleSelectSlide(selectedIdx + dir)} disabled={dis}
                            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/8 flex items-center justify-center disabled:opacity-25 transition-colors">
                            {dir === -1 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={handleSave} disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                      style={{ background: saved ? '#22c55e' : color }}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      {saved ? 'Guardado' : 'Guardar'}
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl overflow-hidden border border-white/[0.07]">
                  <SlidePreview
                    key={`${activePage}-${selectedIdx}`}
                    slide={currentSlide} form={form}
                    onPositionChange={handlePositionChange}
                    onSizeChange={handleSizeChange}
                    pageRatio={activeCfg?.ratio}
                  />
                </div>

                {/* Overlay */}
                <div className="flex items-center gap-3 bg-white/[0.025] rounded-xl px-4 py-2.5 border border-white/[0.05]">
                  <span className="text-[10px] text-white/35 flex-shrink-0 uppercase tracking-wider">Oscuridad</span>
                  <input type="range" min={0} max={0.9} step={0.05}
                    value={form.overlay_opacity ?? 0.45}
                    onChange={e => sf({ overlay_opacity: +e.target.value })}
                    className="flex-1 accent-violet-500" />
                  <span className="text-[10px] text-white/40 w-9 text-right">{Math.round((form.overlay_opacity ?? 0.45) * 100)}%</span>
                </div>

                {/* Secciones de contenido */}
                <div className="space-y-2">

                  {/* Badge */}
                  <Section icon={Sparkles} title="Badge" badge={form.badge_visible ? 'ON' : undefined} defaultOpen={false}>
                    <div className="flex items-center gap-2">
                      <Toggle value={form.badge_visible} onChange={v => sf({ badge_visible: v })} label="Mostrar badge" />
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[10px] text-white/30">Tamaño</span>
                        <PxInput value={form.badge_fs} onChange={v => sf({ badge_fs: v })} min={10} max={32} />
                      </div>
                    </div>
                    {form.badge_visible && (
                      <>
                        <input value={form.badge_text} onChange={e => sf({ badge_text: e.target.value })}
                          className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/25 transition-colors"
                          placeholder="Texto del badge (ej: Catálogo Completo)" />
                        <div>
                          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">Estilo</p>
                          <StylePicker value={form.badge_style} onChange={v => sf({ badge_style: v })} color={color} />
                        </div>
                      </>
                    )}
                  </Section>

                  {/* Título */}
                  <Section icon={Type} title="Título" defaultOpen>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Tamaño · Alineación</span>
                      <div className="flex items-center gap-2">
                        <PxInput value={form.title_fs} onChange={v => sf({ title_fs: v })} min={16} max={200} />
                        <AlignBtns value={form.title_align} onChange={v => sf({ title_align: v })} />
                      </div>
                    </div>
                    <input value={form.title} onChange={e => sf({ title: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/25 transition-colors"
                      placeholder='Ej: Explora Nuestro/Universo Artístico   (/ = 2ª línea en color del contexto)' />
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30 flex-shrink-0 uppercase tracking-wider">Interlineado</span>
                      <input type="range" min={0.7} max={2} step={0.05} value={form.title_lh ?? 1.1}
                        onChange={e => sf({ title_lh: +e.target.value })} className="flex-1 accent-violet-500" />
                      <span className="text-[10px] text-white/40 w-8 text-right">{(form.title_lh ?? 1.1).toFixed(2)}</span>
                    </div>
                  </Section>

                  {/* Subtítulo */}
                  <Section icon={Type} title="Subtítulo">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Tamaño · Alineación</span>
                      <div className="flex items-center gap-2">
                        <PxInput value={form.subtitle_fs} onChange={v => sf({ subtitle_fs: v })} min={10} max={60} />
                        <AlignBtns value={form.subtitle_align} onChange={v => sf({ subtitle_align: v })} />
                      </div>
                    </div>
                    <textarea value={form.subtitle} onChange={e => sf({ subtitle: e.target.value })} rows={2}
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/25 transition-colors resize-none"
                      placeholder="Descripción del slide (opcional)" />
                  </Section>

                  {/* Botón */}
                  <Section icon={Layout} title="Botón">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Tamaño · Alineación</span>
                      <div className="flex items-center gap-2">
                        <PxInput value={form.button_fs} onChange={v => sf({ button_fs: v })} min={10} max={40} />
                        <AlignBtns value={form.button_align} onChange={v => sf({ button_align: v })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={form.button_text} onChange={e => sf({ button_text: e.target.value })}
                        className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/25 transition-colors"
                        placeholder="Texto del botón" />
                      <input value={form.button_url} onChange={e => sf({ button_url: e.target.value })}
                        className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/25 transition-colors"
                        placeholder="URL ej: /catalog" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">Estilo del botón</p>
                      <StylePicker value={form.button_style} onChange={v => sf({ button_style: v })} color={color} />
                    </div>
                  </Section>

                  {/* Cards / Stats */}
                  <Section icon={Maximize2} title="Cards · Estadísticas" badge={form.stats?.length > 0 ? `${form.stats.length} cards` : undefined}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Métricas o datos</span>
                      <button type="button"
                        onClick={() => sf({ stats: [...(form.stats || []), { value: '', label: '' }] })}
                        className="flex items-center gap-1 text-xs border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1.5 rounded-lg transition-colors">
                        <Plus className="h-3 w-3" /> Agregar card
                      </button>
                    </div>

                    {(form.stats || []).length > 0 && (
                      <>
                        <div className="grid grid-cols-5 gap-2 bg-[#0d0d0d] rounded-xl p-3 border border-white/[0.05]">
                          {[
                            { key: 'stats_card_w',   label: 'Ancho',   min: 60,  max: 400 },
                            { key: 'stats_card_h',   label: 'Alto',    min: 40,  max: 300 },
                            { key: 'stats_gap',      label: 'Gap',     min: 0,   max: 80  },
                            { key: 'stats_value_fs', label: 'Valor',   min: 12,  max: 80  },
                            { key: 'stats_label_fs', label: 'Etiqueta',min: 8,   max: 40  },
                          ].map(({ key, label, min, max }) => (
                            <div key={key} className="space-y-1.5">
                              <p className="text-[9px] text-white/25 uppercase tracking-wider">{label}</p>
                              <PxInput value={form[key]} onChange={v => sf({ [key]: v })} min={min} max={max} />
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">Estilo de cards</p>
                          <StylePicker value={form.stats_style} onChange={v => sf({ stats_style: v })} color={color} />
                        </div>
                        <div className="space-y-2">
                          {(form.stats || []).map((stat, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input value={stat.value}
                                onChange={e => sf({ stats: form.stats.map((s, j) => j === i ? { ...s, value: e.target.value } : s) })}
                                className="w-20 bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/25 transition-colors"
                                placeholder="200+" />
                              <input value={stat.label}
                                onChange={e => sf({ stats: form.stats.map((s, j) => j === i ? { ...s, label: e.target.value } : s) })}
                                className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/25 transition-colors"
                                placeholder="Obras" />
                              <button type="button"
                                onClick={() => sf({ stats: form.stats.filter((_, j) => j !== i) })}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/15 transition-colors flex-shrink-0">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {(form.stats || []).length === 0 && (
                      <p className="text-xs text-white/15 italic text-center py-3">Sin cards en este slide</p>
                    )}
                  </Section>

                </div>

                {error && (
                  <div className="bg-red-950/30 border border-red-900/40 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}