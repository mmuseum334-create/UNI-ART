'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isAdmin } from '@/services/rbac/permissionService';

/**
 * ProtectedRoute - Componente para proteger rutas según permisos
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene permiso
 * @param {string} props.resource - Recurso requerido (opcional)
 * @param {string} props.permission - Tipo de permiso requerido (opcional)
 * @param {string} props.requiredRole - Rol específico requerido (opcional)
 * @param {boolean} props.requireAuth - Requiere estar autenticado (default: true)
 * @param {boolean} props.adminOnly - Solo admins pueden acceder (opcional)
 * @param {string} props.redirectTo - Ruta a redirigir si no tiene permiso (default: '/')
 * @param {React.ReactNode} props.fallback - Componente a mostrar mientras carga (opcional)
 */
export const ProtectedRoute = ({
  children,
  resource,
  permission,
  requiredRole,
  requireAuth = true,
  adminOnly = false,
  redirectTo = '/',
  fallback = null,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = () => {
      // Esperar a que termine de cargar el usuario
      if (isLoading) return;

      // Verificar si requiere autenticación
      if (requireAuth && !isAuthenticated) {
        console.log('❌ No autenticado, redirigiendo a /auth');
        router.push('/auth');
        return;
      }

      // Verificar si es solo para admins
      if (adminOnly && !isAdmin(user)) {
        console.log('❌ No es admin, redirigiendo');
        router.push(redirectTo);
        return;
      }

      // Verificar rol específico
      if (requiredRole && user?.role?.name !== requiredRole) {
        console.log(`❌ Rol requerido: ${requiredRole}, usuario tiene: ${user?.role?.name}`);
        router.push(redirectTo);
        return;
      }

      // Verificar permiso sobre recurso
      if (resource && permission && !hasPermission(user, resource, permission)) {
        console.log(`❌ Sin permiso ${permission} en ${resource}`);
        router.push(redirectTo);
        return;
      }

      // Si pasó todas las verificaciones
      setIsChecking(false);
    };

    checkPermissions();
  }, [user, isLoading, isAuthenticated, resource, permission, requiredRole, requireAuth, adminOnly, redirectTo, router]);

  // Mostrar loader mientras verifica
  if (isLoading || isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Renderizar contenido protegido
  return <>{children}</>;
};

/**
 * withProtectedRoute - HOC para envolver páginas completas
 *
 * @param {React.Component} Component - Componente a proteger
 * @param {Object} options - Opciones de protección
 * @returns {React.Component}
 */
export const withProtectedRoute = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};
