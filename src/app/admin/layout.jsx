'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Shield, Tag, Palette,
  Frame, Landmark, ChevronLeft, ChevronRight, Image,
  ClipboardList,
} from 'lucide-react';
import { useColor } from '@/contexts/ColorContext';
import { NotificationBell } from '@/components/ui/NotificationBell';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/admin' },
  { label: 'Solicitudes',  icon: ClipboardList,   path: '/admin/paint-requests', badge: true },
  { label: 'Pinturas',     icon: Frame,           path: '/admin/paintings' },
  { label: 'Esculturas',   icon: Landmark,        path: '/admin/sculptures' },
  { label: 'Banners',      icon: Image,           path: '/admin/banner' },
  { label: 'Usuarios',     icon: Users,           path: '/admin/users' },
  { label: 'Roles',        icon: Shield,          path: '/admin/roles' },
  { label: 'Categorías',   icon: Tag,             path: '/admin/categories' },
  { label: 'Técnicas',     icon: Palette,         path: '/admin/techniques' },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { color } = useColor();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col shrink-0 transition-all duration-300
          bg-white dark:bg-dark-secondary
          border-r border-slate-200 dark:border-dark-tertiary
          ${collapsed ? 'w-16' : 'w-56'}
        `}
      >
        {/* Header del sidebar */}
        <div className={`flex h-14 items-center border-b border-slate-200 dark:border-dark-tertiary px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(({ label, icon: Icon, path, badge }) => {
            const active = pathname === path || pathname.startsWith(path + '/');
            const isSolicitudes = path === '/admin/paint-requests';
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                title={collapsed ? label : undefined}
                className={`
                  w-full flex items-center gap-3 rounded-lg px-2.5 py-2
                  text-sm font-medium transition-colors
                  ${active
                    ? 'text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-tertiary hover:text-slate-900 dark:hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                style={active ? { backgroundColor: color } : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{label}</span>
                )}
                {/* Indicador de sección "Solicitudes" cuando no está activa */}
                {!collapsed && isSolicitudes && !active && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#f59e0b' }}
                    title="Solicitudes pendientes"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto mt-16 relative">
        {/* Campana de notificaciones en la esquina superior derecha del contenido */}
        <div className="absolute top-3 right-4 z-40">
          <NotificationBell />
        </div>
        {children}
      </div>
    </div>
  );
}
