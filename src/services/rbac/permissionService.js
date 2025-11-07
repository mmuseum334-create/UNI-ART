/**
 * Permission Service - Helpers para verificar permisos
 * Funciones de utilidad para verificar acceso a recursos
 */

/**
 * Recursos/Vistas disponibles en el sistema
 * Estos deben coincidir con los recursos definidos en el backend
 */
export const RESOURCES = {
  // Gestión de pinturas
  PAINTINGS: 'paintings',
  PAINTINGS_LIST: 'paintings.list',
  PAINTINGS_CREATE: 'paintings.create',
  PAINTINGS_EDIT: 'paintings.edit',
  PAINTINGS_DELETE: 'paintings.delete',

  // Gestión de esculturas
  SCULPTURES: 'sculptures',
  SCULPTURES_LIST: 'sculptures.list',
  SCULPTURES_CREATE: 'sculptures.create',
  SCULPTURES_EDIT: 'sculptures.edit',
  SCULPTURES_DELETE: 'sculptures.delete',

  // Gestión de usuarios
  USERS: 'users',
  USERS_LIST: 'users.list',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_ASSIGN_ROLES: 'users.assign_roles',

  // Gestión de roles
  ROLES: 'roles',
  ROLES_LIST: 'roles.list',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN_PERMISSIONS: 'roles.assign_permissions',

  // Catálogo público
  CATALOG: 'catalog',
  CATALOG_VIEW: 'catalog.view',

  // Perfiles
  PROFILE: 'profile',
  PROFILE_VIEW: 'profile.view',
  PROFILE_EDIT: 'profile.edit',

  // AR (Realidad Aumentada)
  AR: 'ar',
  AR_VIEW: 'ar.view',

  // Dashboard de administración
  ADMIN_DASHBOARD: 'admin.dashboard',
};

/**
 * Tipos de permisos
 */
export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
};

/**
 * Roles del sistema
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  ARTIST: 'artist',
  USER: 'user',
  GUEST: 'guest',
};

/**
 * Verifica si un usuario tiene un rol específico
 * @param {Object} user - Usuario con su rol
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  return user.role.name === requiredRole;
};

/**
 * Verifica si un usuario es Super Admin
 * @param {Object} user - Usuario con su rol
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  return hasRole(user, ROLES.SUPER_ADMIN);
};

/**
 * Verifica si un usuario es Admin o Super Admin
 * @param {Object} user - Usuario con su rol
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN) || isSuperAdmin(user);
};

/**
 * Verifica si un usuario tiene permiso sobre un recurso
 * @param {Object} user - Usuario con su rol y permisos
 * @param {string} resource - Recurso a verificar
 * @param {string} permission - Tipo de permiso (view, create, edit, delete)
 * @returns {boolean}
 */
export const hasPermission = (user, resource, permission) => {
  // Super Admin tiene todos los permisos
  if (isSuperAdmin(user)) return true;

  if (!user || !user.role || !user.role.permissions) return false;

  // Buscar el permiso específico del recurso
  const resourcePermission = user.role.permissions.find(
    (perm) => perm.resource === resource
  );

  if (!resourcePermission) return false;

  // Verificar el tipo de permiso
  switch (permission) {
    case PERMISSIONS.VIEW:
      return resourcePermission.canView === true;
    case PERMISSIONS.CREATE:
      return resourcePermission.canCreate === true;
    case PERMISSIONS.EDIT:
      return resourcePermission.canEdit === true;
    case PERMISSIONS.DELETE:
      return resourcePermission.canDelete === true;
    default:
      return false;
  }
};

/**
 * Verifica si un usuario puede ver un recurso
 * @param {Object} user - Usuario
 * @param {string} resource - Recurso
 * @returns {boolean}
 */
export const canView = (user, resource) => {
  return hasPermission(user, resource, PERMISSIONS.VIEW);
};

/**
 * Verifica si un usuario puede crear en un recurso
 * @param {Object} user - Usuario
 * @param {string} resource - Recurso
 * @returns {boolean}
 */
export const canCreate = (user, resource) => {
  return hasPermission(user, resource, PERMISSIONS.CREATE);
};

/**
 * Verifica si un usuario puede editar un recurso
 * @param {Object} user - Usuario
 * @param {string} resource - Recurso
 * @returns {boolean}
 */
export const canEdit = (user, resource) => {
  return hasPermission(user, resource, PERMISSIONS.EDIT);
};

/**
 * Verifica si un usuario puede eliminar un recurso
 * @param {Object} user - Usuario
 * @param {string} resource - Recurso
 * @returns {boolean}
 */
export const canDelete = (user, resource) => {
  return hasPermission(user, resource, PERMISSIONS.DELETE);
};

/**
 * Verifica si un usuario puede asignar rol de Super Admin
 * Solo los Super Admin pueden hacerlo
 * @param {Object} user - Usuario
 * @returns {boolean}
 */
export const canAssignSuperAdmin = (user) => {
  return isSuperAdmin(user);
};

/**
 * Verifica si un usuario puede acceder al panel de administración
 * @param {Object} user - Usuario
 * @returns {boolean}
 */
export const canAccessAdminPanel = (user) => {
  return isAdmin(user) || hasPermission(user, RESOURCES.ADMIN_DASHBOARD, PERMISSIONS.VIEW);
};

/**
 * Verifica si un usuario es dueño del recurso
 * @param {Object} user - Usuario
 * @param {Object} resource - Recurso con userId o authorId
 * @returns {boolean}
 */
export const isOwner = (user, resource) => {
  if (!user || !resource) return false;
  return resource.userId === user.id || resource.authorId === user.id;
};

/**
 * Verifica si un usuario puede editar un recurso específico
 * (Admins pueden editar todo, usuarios solo sus recursos)
 * @param {Object} user - Usuario
 * @param {Object} resource - Recurso a editar
 * @param {string} resourceType - Tipo de recurso (paintings, sculptures, etc.)
 * @returns {boolean}
 */
export const canEditResource = (user, resource, resourceType) => {
  if (!user) return false;

  // Admins pueden editar todo
  if (isAdmin(user)) return true;

  // Verificar permiso de edición y que sea dueño
  return canEdit(user, resourceType) && isOwner(user, resource);
};

/**
 * Verifica si un usuario puede eliminar un recurso específico
 * (Admins pueden eliminar todo, usuarios solo sus recursos)
 * @param {Object} user - Usuario
 * @param {Object} resource - Recurso a eliminar
 * @param {string} resourceType - Tipo de recurso (paintings, sculptures, etc.)
 * @returns {boolean}
 */
export const canDeleteResource = (user, resource, resourceType) => {
  if (!user) return false;

  // Admins pueden eliminar todo
  if (isAdmin(user)) return true;

  // Verificar permiso de eliminación y que sea dueño
  return canDelete(user, resourceType) && isOwner(user, resource);
};

/**
 * Obtiene los permisos de un usuario en formato legible
 * @param {Object} user - Usuario con rol y permisos
 * @returns {Object} Objeto con todos los permisos del usuario
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return {};

  const permissions = {};

  if (user.role.permissions) {
    user.role.permissions.forEach((perm) => {
      permissions[perm.resource] = {
        view: perm.canView,
        create: perm.canCreate,
        edit: perm.canEdit,
        delete: perm.canDelete,
      };
    });
  }

  return permissions;
};
