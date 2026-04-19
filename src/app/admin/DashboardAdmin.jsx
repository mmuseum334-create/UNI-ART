'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Shield, Landmark, Frame, Tag, Palette,
  Plus, ChevronRight, Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useColor } from '@/contexts/ColorContext';
import { roleService } from '@/services/rbac/roleService';
import { paintService } from '@/services/paint/paintService';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { categoryService } from '@/services/categoryService';
import { techniqueService } from '@/services/techniqueService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { color } = useColor();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalSculptures: 0,
    totalPaintings: 0,
    totalCategories: 0,
    totalTechniques: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [users, roles, sculptures, paintings, categories, techniques] = await Promise.all([
        roleService.getAllUsers(),
        roleService.getAllRoles(),
        sculptureService.getAll(),
        paintService.getAll(),
        categoryService.getAll(),
        techniqueService.getAll(),
      ]);
      setStats({
        totalUsers:      users.success      ? users.data.length      : 0,
        totalRoles:      roles.success      ? roles.data.length      : 0,
        totalSculptures: sculptures.success ? sculptures.data.length : 0,
        totalPaintings:  paintings.success  ? paintings.data.length  : 0,
        totalCategories: categories.success ? categories.data.length : 0,
        totalTechniques: techniques.success ? techniques.data.length : 0,
      });
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const quickActions = [
    { title: 'Gestionar Roles',      description: 'Crear y editar roles del sistema',    icon: Shield,   path: '/admin/roles' },
    { title: 'Gestionar Usuarios',   description: 'Ver y asignar roles a usuarios',       icon: Users,    path: '/admin/users' },
    { title: 'Categorías',           description: 'Administrar categorías de obras',      icon: Tag,      path: '/admin/categories' },
    { title: 'Técnicas',             description: 'Administrar técnicas artísticas',      icon: Palette,  path: '/admin/techniques' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: color, borderTopColor: 'transparent' }} />
          <p className="text-sm text-slate-500 dark:text-slate-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Bienvenido, <span style={{ color }}>{user?.name?.split(' ')[0] ?? 'Admin'}</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
          Panel de administración del museo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Pinturas"    value={stats.totalPaintings}  icon={Frame}    color={color} />
        <StatCard title="Esculturas"  value={stats.totalSculptures} icon={Landmark} color={color} />
        <StatCard title="Usuarios"    value={stats.totalUsers}      icon={Users}    color={color} />
        <StatCard title="Roles"       value={stats.totalRoles}      icon={Shield}   color={color} />
        <StatCard title="Categorías"  value={stats.totalCategories} icon={Tag}      color={color} />
        <StatCard title="Técnicas"    value={stats.totalTechniques} icon={Palette}  color={color} />
      </div>

      {/* Acciones rápidas + Actividad */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Acciones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Acciones Rápidas</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <ActionCard
                  key={action.path}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  color={color}
                  onClick={() => router.push(action.path)}
                />
              ))}
            </div>
          </div>

          {/* Colección */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Colección</h2>
              <button
                onClick={() => router.push('/catalog')}
                className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Ver todo <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <CollectionCard title="Pinturas"   count={stats.totalPaintings}  icon={Frame}    bgColor="bg-amber-500/10"   textColor="text-amber-500" />
              <CollectionCard title="Esculturas" count={stats.totalSculptures} icon={Landmark} bgColor="bg-emerald-500/10" textColor="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="rounded-xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Actividad Reciente</h2>
            <span className="rounded-full bg-slate-100 dark:bg-dark-tertiary px-2.5 py-0.5 text-xs text-slate-500 dark:text-slate-400">Hoy</span>
          </div>
          <div className="space-y-3">
            {[
              { action: 'Nueva pintura agregada',  time: 'Hace 5 min',   user: 'Ana Garcia' },
              { action: 'Usuario registrado',       time: 'Hace 1 hora',  user: 'Sistema' },
              { action: 'Categoría modificada',     time: 'Hace 2 horas', user: 'Admin' },
              { action: 'Escultura actualizada',    time: 'Hace 3 horas', user: 'Admin' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-dark-tertiary/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
                  <Clock className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.action}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-200">{item.user} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg mb-3" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-dark-tertiary bg-slate-50 dark:bg-dark-tertiary/30 p-4 text-left transition-all hover:shadow-sm"
      style={{ '--hover-border': color }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = ''}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <Plus className="h-4 w-4 text-slate-400 shrink-0" />
    </button>
  );
}

function CollectionCard({ title, count, icon: Icon, bgColor, textColor }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 dark:border-dark-tertiary bg-slate-50 dark:bg-dark-tertiary/30 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgColor} ${textColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{count}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      </div>
    </div>
  );
}
