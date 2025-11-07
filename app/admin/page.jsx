'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';
import { roleService } from '@/services/rbac/roleService';
import { sculptureService } from '@/services/sculpture/sculptureService';

/**
 * Dashboard de Administración
 * Panel principal para administradores del sistema
 */
export default function AdminDashboard() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { user, isSuperAdmin } = usePermissions();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalSculptures: 0,
    totalPaintings: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);

    // Cargar estadísticas
    const [usersResult, rolesResult, sculpturesResult] = await Promise.all([
      roleService.getAllUsers(),
      roleService.getAllRoles(),
      sculptureService.getAll(),
    ]);

    setStats({
      totalUsers: usersResult.success ? usersResult.data.length : 0,
      totalRoles: rolesResult.success ? rolesResult.data.length : 0,
      totalSculptures: sculpturesResult.success ? sculpturesResult.data.length : 0,
      totalPaintings: 0, // TODO: Implementar cuando esté el servicio
    });

    setIsLoading(false);
  };

  const adminModules = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios y asigna roles',
      icon: '👥',
      path: '/admin/users',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      title: 'Gestión de Roles',
      description: 'Crea y configura roles y permisos',
      icon: '🔐',
      path: '/admin/roles',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      superAdminOnly: false,
    },
    {
      title: 'Esculturas',
      description: 'Administra las esculturas del museo',
      icon: '🗿',
      path: '/sculptures',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      title: 'Pinturas',
      description: 'Administra las pinturas del museo',
      icon: '🖼️',
      path: '/catalog',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-purple-600 hover:text-purple-800 mb-4 flex items-center"
          >
            ← Volver al Inicio
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-600">
                Bienvenido, <span className="font-semibold">{user?.name}</span>
              </p>
            </div>

            {isSuperAdmin() && (
              <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg">
                🌟 Super Admin
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon="👥"
            color="bg-blue-500"
          />
          <StatsCard
            title="Roles Activos"
            value={stats.totalRoles}
            icon="🔐"
            color="bg-purple-500"
          />
          <StatsCard
            title="Esculturas"
            value={stats.totalSculptures}
            icon="🗿"
            color="bg-green-500"
          />
          <StatsCard
            title="Pinturas"
            value={stats.totalPaintings}
            icon="🖼️"
            color="bg-yellow-500"
          />
        </div>

        {/* Admin Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos de Administración</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminModules.map((module) => {
              // Filtrar módulos solo para super admin
              if (module.superAdminOnly && !isSuperAdmin()) {
                return null;
              }

              return (
                <div
                  key={module.path}
                  onClick={() => router.push(module.path)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`${module.color} h-2`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{module.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    <button
                      className={`w-full px-4 py-2 ${module.color} text-white rounded-lg ${module.hoverColor} transition-colors`}
                    >
                      Acceder →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              label="Crear Nuevo Rol"
              icon="➕"
              onClick={() => router.push('/admin/roles')}
            />
            <QuickActionButton
              label="Ver Todos los Usuarios"
              icon="📋"
              onClick={() => router.push('/admin/users')}
            />
            <QuickActionButton
              label="Subir Escultura"
              icon="⬆️"
              onClick={() => router.push('/upload-sculpture')}
            />
          </div>
        </div>

        {/* System Info */}
        {isSuperAdmin() && (
          <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ℹ️ Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Rol: <span className="font-semibold text-gray-900">{user?.role?.name}</span></p>
                <p className="text-gray-600">Email: <span className="font-semibold text-gray-900">{user?.email}</span></p>
              </div>
              <div>
                <p className="text-gray-600">ID: <span className="font-semibold text-gray-900">{user?.id}</span></p>
                <p className="text-gray-600">Permisos: <span className="font-semibold text-gray-900">Acceso Total</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className={`${color} h-2`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}
