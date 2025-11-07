'use client';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * PermissionGate - Componente para mostrar/ocultar elementos según permisos
 *
 * Uso:
 * <PermissionGate resource="paintings" permission="create">
 *   <button>Crear Pintura</button>
 * </PermissionGate>
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene permiso
 * @param {string} props.resource - Recurso a verificar (opcional)
 * @param {string} props.permission - Tipo de permiso (view, create, edit, delete) (opcional)
 * @param {string} props.role - Rol requerido (opcional)
 * @param {boolean} props.adminOnly - Solo admins pueden ver (opcional)
 * @param {boolean} props.superAdminOnly - Solo super admins pueden ver (opcional)
 * @param {React.ReactNode} props.fallback - Contenido alternativo si no tiene permiso (opcional)
 */
export const PermissionGate = ({
  children,
  resource,
  permission,
  role,
  adminOnly = false,
  superAdminOnly = false,
  fallback = null,
}) => {
  const {
    hasPermission,
    hasRole,
    isAdmin,
    isSuperAdmin,
  } = usePermissions();

  // Verificar super admin
  if (superAdminOnly && !isSuperAdmin()) {
    return fallback;
  }

  // Verificar admin
  if (adminOnly && !isAdmin()) {
    return fallback;
  }

  // Verificar rol específico
  if (role && !hasRole(role)) {
    return fallback;
  }

  // Verificar permiso sobre recurso
  if (resource && permission && !hasPermission(resource, permission)) {
    return fallback;
  }

  // Si pasó todas las verificaciones, renderizar children
  return <>{children}</>;
};

/**
 * ShowForRole - Componente para mostrar contenido solo a un rol específico
 *
 * Uso:
 * <ShowForRole role="admin">
 *   <AdminPanel />
 * </ShowForRole>
 */
export const ShowForRole = ({ children, role, fallback = null }) => {
  return (
    <PermissionGate role={role} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * ShowForAdmin - Componente para mostrar contenido solo a admins
 *
 * Uso:
 * <ShowForAdmin>
 *   <AdminButton />
 * </ShowForAdmin>
 */
export const ShowForAdmin = ({ children, fallback = null }) => {
  return (
    <PermissionGate adminOnly fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * ShowForSuperAdmin - Componente para mostrar contenido solo a super admins
 *
 * Uso:
 * <ShowForSuperAdmin>
 *   <AssignSuperAdminButton />
 * </ShowForSuperAdmin>
 */
export const ShowForSuperAdmin = ({ children, fallback = null }) => {
  return (
    <PermissionGate superAdminOnly fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * ShowWithPermission - Componente para mostrar contenido con permiso específico
 *
 * Uso:
 * <ShowWithPermission resource="paintings" permission="create">
 *   <CreateButton />
 * </ShowWithPermission>
 */
export const ShowWithPermission = ({ children, resource, permission, fallback = null }) => {
  return (
    <PermissionGate resource={resource} permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};
