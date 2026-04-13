'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useColor } from '@/contexts/ColorContext';

/* ── useConfirm hook ── */
export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', desc: '', resolve: null });

  const confirm = (title, desc = 'Esta acción no se puede deshacer.') =>
    new Promise(resolve => setState({ open: true, title, desc, resolve }));

  const handleResponse = (value) => {
    state.resolve?.(value);
    setState({ open: false, title: '', desc: '', resolve: null });
  };

  const Dialog = () => {
    if (!state.open) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-6 px-4">
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => handleResponse(false)} />
        {/* card — mismo estilo oscuro que sileo */}
        <div className="relative w-full max-w-sm rounded-2xl bg-[#1a1a1a] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          {/* header badge area */}
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-1">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>
            <p className="text-sm font-semibold text-red-400">{state.title}</p>
          </div>
          {/* description */}
          <p className="px-5 pb-4 pt-1 text-[13px] text-white/50 leading-relaxed">{state.desc}</p>
          {/* divider */}
          <div className="h-px bg-white/8" />
          {/* actions */}
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => handleResponse(false)}
              className="flex-1 rounded-xl py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="flex-1 rounded-xl py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmDialog: Dialog };
}

/* ── usePagination hook ── */
export function usePagination(items, perPage = 15) {
  const [page, setPage] = useState(1);
  const total     = Math.ceil(items.length / perPage);
  const paged     = items.slice((page - 1) * perPage, page * perPage);
  const goTo      = (p) => setPage(Math.max(1, Math.min(p, total)));
  const reset     = ()  => setPage(1);
  return { page, total, paged, goTo, reset };
}

/* ── Pagination UI ── */
export function Pagination({ page, total, goTo }) {
  const { color } = useColor();
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1)
    .filter(p => p === 1 || p === total || Math.abs(p - page) <= 1);

  const withEllipsis = pages.reduce((acc, p, i, arr) => {
    if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
    acc.push(p);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-tertiary">
      <span className="text-xs text-slate-400 dark:text-slate-500">
        Página {page} de {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {withEllipsis.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="w-8 text-center text-xs text-slate-400">…</span>
            : <button
                key={p}
                onClick={() => goTo(p)}
                className="h-8 w-8 rounded-lg text-sm font-semibold transition-colors"
                style={page === p ? { backgroundColor: color, color: 'white' } : undefined}
                {...(page !== p ? {
                  className: 'h-8 w-8 rounded-lg text-sm font-semibold transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-tertiary'
                } : {})}
              >
                {p}
              </button>
        )}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === total}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Select ── */
export function FormSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-tertiary bg-slate-50 dark:bg-dark-tertiary px-3.5 py-2.5 pr-9 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition"
      >
        {children}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-slate-400" />
    </div>
  );
}

/* ── Page wrapper ── */
export function AdminPage({ children }) {
  return (
    <div className="min-h-full p-6 space-y-6">
      {children}
    </div>
  );
}

/* ── Page header ── */
export function AdminHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-tertiary">
            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ── Primary button ── */
export function PrimaryBtn({ children, onClick, type = 'button', disabled, icon: Icon, form }) {
  const { color } = useColor();
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      form={form}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
      style={{ backgroundColor: color }}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ── Ghost button ── */
export function GhostBtn({ children, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-xl border border-slate-200 dark:border-dark-tertiary px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-tertiary transition-colors"
    >
      {children}
    </button>
  );
}

/* ── Search input ── */
export function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative w-full max-w-sm">
      <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
      />
    </div>
  );
}

/* ── Table card wrapper ── */
export function TableCard({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

/* ── Table ── */
export function Table({ headers, children, loading, color }) {
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div
            className="h-7 w-7 animate-spin rounded-full border-[3px] border-t-transparent"
            style={{ borderColor: color, borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-100 dark:divide-dark-tertiary">
          <thead className="bg-slate-50 dark:bg-dark-tertiary/50">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-tertiary">
            {children}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── Empty row ── */
export function EmptyRow({ cols, message }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-16 text-center text-sm text-slate-400 dark:text-slate-500">
        {message}
      </td>
    </tr>
  );
}

/* ── Icon action button ── */
export function IconBtn({ icon: Icon, onClick, variant = 'default', title }) {
  const cls = {
    default: 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary',
    danger:  'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
  }[variant];
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg p-1.5 transition-colors ${cls}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-dark-tertiary flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Form field ── */
export function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}

/* ── Input ── */
export function FormInput({ value, onChange, placeholder, required, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-200 dark:border-dark-tertiary bg-slate-50 dark:bg-dark-tertiary px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition"
    />
  );
}

/* ── Textarea ── */
export function FormTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-slate-200 dark:border-dark-tertiary bg-slate-50 dark:bg-dark-tertiary px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition"
    />
  );
}

/* ── Error banner ── */
export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
      {message}
    </div>
  );
}

/* ── Avatar initials ── */
export function Avatar({ name, color }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  return (
    <div
      className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
