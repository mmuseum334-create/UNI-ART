/**
 * Custom Hook: usePermissions
 * Hook para verificar permisos del usuario actual
 */

import { useAuth } from '@/contexts/AuthContext';
import {
  hasPermission,
  canView,
  canCreate,
  canEdit,
  canDelete,
  isAdmin,
  isSuperAdmin,
  canAccessAdminPanel,
  canAssignSuperAdmin,
  hasRole,
  canEditResource,
  canDeleteResource,
  getUserPermissions,
  RESOURCES,
  PERMISSIONS,
  ROLES,
} from '@/services/rbac/permissionService';

/**
 * Hook principal de permisos
 * Proporciona funciones para verificar permisos del usuario actual
 */
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    // Usuario actual
    user,

    // Verificación de roles
    hasRole: (role) => hasRole(user, role),
    isAdmin: () => isAdmin(user),
    isSuperAdmin: () => isSuperAdmin(user),

    // Verificación de permisos generales
    hasPermission: (resource, permission) => hasPermission(user, resource, permission),
    canView: (resource) => canView(user, resource),
    canCreate: (resource) => canCreate(user, resource),
    canEdit: (resource) => canEdit(user, resource),
    canDelete: (resource) => canDelete(user, resource),

    // Verificación de permisos sobre recursos específicos
    canEditResource: (resource, resourceType) => canEditResource(user, resource, resourceType),
    canDeleteResource: (resource, resourceType) => canDeleteResource(user, resource, resourceType),

    // Permisos especiales
    canAccessAdminPanel: () => canAccessAdminPanel(user),
    canAssignSuperAdmin: () => canAssignSuperAdmin(user),

    // Obtener todos los permisos
    getUserPermissions: () => getUserPermissions(user),

    // Constantes
    RESOURCES,
    PERMISSIONS,
    ROLES,
  };
};

/**
 * Hook para verificar si el usuario tiene un rol específico
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean}
 */
export const useRole = (requiredRole) => {
  const { user } = useAuth();
  return hasRole(user, requiredRole);
};

/**
 * Hook para verificar si el usuario es admin
 * @returns {boolean}
 */
export const useIsAdmin = () => {
  const { user } = useAuth();
  return isAdmin(user);
};

/**
 * Hook para verificar si el usuario es super admin
 * @returns {boolean}
 */
export const useIsSuperAdmin = () => {
  const { user } = useAuth();
  return isSuperAdmin(user);
};

/**
 * Hook para verificar acceso a un recurso específico
 * @param {string} resource - Recurso a verificar
 * @param {string} permission - Tipo de permiso (view, create, edit, delete)
 * @returns {boolean}
 */
export const useResourcePermission = (resource, permission) => {
  const { user } = useAuth();
  return hasPermission(user, resource, permission);
};
