'use client';

import { Sparkles, GripVertical } from 'lucide-react';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
export const getElStyle = (styleVal, ctxColor) => {
  if (styleVal === 'glass')   return { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' };
  if (styleVal === 'context') return { background: ctxColor, border: `1px solid ${ctxColor}`, color: 'white' };
  return { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.5)', color: '#111' };
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
const Wrap = ({ el, x, y, children, rD, rW, rH, draggable, activeEl, onStart, onResizeStart }) => {
  if (!draggable) return (
    <div className="absolute z-20" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>{children}</div>
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

export const BannerContent = ({ form, color, draggable = false, activeEl = null, onStart, onResizeStart }) => {
  const badgeStyle  = getElStyle(form.badge_style  || 'glass',   color);
  const btnStyle    = getElStyle(form.button_style  || 'context', color);
  const statsStyle  = getElStyle(form.stats_style   || 'glass',   color);

  return (
    <>
      {/* Badge */}
      {form.badge_visible && form.badge_text && (
        <Wrap el="badge" x={form.badge_x ?? 50} y={form.badge_y ?? 18} rD draggable={draggable} activeEl={activeEl} onStart={onStart} onResizeStart={onResizeStart}>
          <div className="inline-flex items-center gap-2 rounded-full whitespace-nowrap"
            style={{ ...badgeStyle, fontSize: form.badge_fs ?? 14, padding: `${Math.round((form.badge_fs ?? 14) * 0.4)}px ${Math.round((form.badge_fs ?? 14) * 1.1)}px` }}>
            <Sparkles style={{ width: (form.badge_fs ?? 14) * 0.85, height: (form.badge_fs ?? 14) * 0.85, flexShrink: 0 }} />
            {form.badge_text}
          </div>
        </Wrap>
      )}

      {/* Título */}
      {form.title && (
        <Wrap el="title" x={form.title_x ?? 50} y={form.title_y ?? 38} rD draggable={draggable} activeEl={activeEl} onStart={onStart} onResizeStart={onResizeStart}>
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
        <Wrap el="subtitle" x={form.subtitle_x ?? 50} y={form.subtitle_y ?? 57} rD draggable={draggable} activeEl={activeEl} onStart={onStart} onResizeStart={onResizeStart}>
          <div className="text-white/85 leading-relaxed"
            style={{ fontSize: form.subtitle_fs ?? 18, textAlign: form.subtitle_align || 'center',}}>
            {form.subtitle}
          </div>
        </Wrap>
      )}

      {/* Botón */}
      {form.button_text && (
        <Wrap el="button" x={form.button_x ?? 50} y={form.button_y ?? 72} rD draggable={draggable} activeEl={activeEl} onStart={onStart} onResizeStart={onResizeStart}>
          <div style={{ textAlign: form.button_align || 'center' }}>
            {form.button_url ? (
              <a href={form.button_url} className="inline-block font-semibold rounded-xl whitespace-nowrap cursor-pointer hover:scale-105 transition-transform pointer-events-auto"
                draggable={false}
                onClick={(e) => {
                  if (draggable) {
                    e.preventDefault(); // Prevenir navegación en modo de edición para no salir de la página
                  } else {
                    // Forzar la navegación saltándose cualquier router interno que pueda estar bloqueando
                    window.location.href = form.button_url;
                  }
                }}
                style={{ ...btnStyle, fontSize: form.button_fs ?? 16, padding: `${Math.round((form.button_fs ?? 16) * 0.55)}px ${Math.round((form.button_fs ?? 16) * 1.4)}px`, textDecoration: 'none' }}>
                {form.button_text}
              </a>
            ) : (
              <span className="inline-block font-semibold rounded-xl whitespace-nowrap cursor-pointer pointer-events-auto"
                style={{ ...btnStyle, fontSize: form.button_fs ?? 16, padding: `${Math.round((form.button_fs ?? 16) * 0.55)}px ${Math.round((form.button_fs ?? 16) * 1.4)}px` }}>
                {form.button_text}
              </span>
            )}
          </div>
        </Wrap>
      )}

      {/* Stats / Cards */}
      {form.stats?.length > 0 && (
        <Wrap el="stats" x={form.stats_x ?? 50} y={form.stats_y ?? 85} rD rW rH draggable={draggable} activeEl={activeEl} onStart={onStart} onResizeStart={onResizeStart}>
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
