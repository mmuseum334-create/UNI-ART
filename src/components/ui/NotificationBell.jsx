'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Palette, Frame } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useColor } from '@/contexts/ColorContext';

const TYPE_ICON = {
  PAINT_SUBMITTED: Frame,
  PAINT_APPROVED: Palette,
};

const TYPE_COLORS = {
  PAINT_SUBMITTED: 'text-amber-500',
  PAINT_APPROVED:  'text-emerald-500',
};

export function NotificationBell() {
  const { color } = useColor();
  const [open, setOpen]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]     = useState(0);
  const [loading, setLoading]   = useState(false);
  const ref = useRef(null);

  const loadCount = async () => {
    const res = await notificationService.getUnreadCount();
    if (res.success) setUnread(res.count);
  };

  const loadAll = async () => {
    setLoading(true);
    const res = await notificationService.getAll();
    if (res.success) setNotifications(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30_000); // Polling cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) loadAll();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Ahora';
    if (mins < 60)  return `Hace ${mins}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Botón campana */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className="relative rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
        title="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-tertiary">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Notificaciones {unread > 0 && <span className="text-xs font-normal text-slate-400">({unread} sin leer)</span>}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">Cargando...</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">Sin notificaciones</p>
              </div>
            )}
            {notifications.map(n => {
              const Icon = TYPE_ICON[n.type] || Bell;
              const iconColor = TYPE_COLORS[n.type] || 'text-slate-400';
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-dark-tertiary/50 last:border-0 transition-colors ${
                    !n.leida ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <span className={`mt-0.5 shrink-0 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.leida ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.leida && (
                    <span className="mt-1 shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
